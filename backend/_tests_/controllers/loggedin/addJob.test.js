// tests/addJob.test.js
const { addJob } = require("../../../controllers/loggedin");
const Jobs = require("../../../models/jobs");

jest.mock("../../../models/jobs", () => {
    // When your controller does: new Jobs(...)
    const JobsMock = jest.fn();

    // Static method: Jobs.assignEmployeesToJob(...)
    JobsMock.assignEmployeesToJob = jest.fn();

    return JobsMock;
    });

    // helper: fake Express res
    const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
    };

    // helper: fake socket.io
    const makeIo = () => {
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    return { to, emit };
    };

    describe("addJob controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns 401 if req.user missing", async () => {
        const req = { user: null, body: {}, app: { get: jest.fn() } };
        const res = makeRes();

        await addJob(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "unauthenticated" });
    });

    test("returns 400 if jobid is not an integer", async () => {
        const req = {
        user: { orgId: 1 },
        body: { jobid: "JOB123", employeeIds: [] },
        app: { get: jest.fn() },
        };
        const res = makeRes();

        await addJob(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "jobid must be an integer" });
    });

    test("returns 500 if insert fails (bad affectedRows/insertId)", async () => {
        // Make new Jobs(...).addJob() return a failure-ish result
        Jobs.mockImplementation(() => ({
        addJob: jest.fn().mockResolvedValue({ affectedRows: 0, insertId: null }),
        }));

        const req = {
        user: { orgId: 1 },
        body: { jobid: "123", employeeIds: [] },
        app: { get: jest.fn() },
        };
        const res = makeRes();

        await addJob(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
        error: "Failed to add job, please try again later.",
        });
    });

    test("returns 200 ok:true when insert succeeds (no employee assignments)", async () => {
        Jobs.mockImplementation(() => ({
        addJob: jest.fn().mockResolvedValue({ affectedRows: 1, insertId: 77 }),
        }));

        const io = makeIo();
        const req = {
        user: { orgId: 5 },
        body: { jobid: "123", employeeIds: [] },
        app: { get: jest.fn().mockReturnValue(io) },
        };
        const res = makeRes();

        await addJob(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ ok: true });

        // should emit jobs:changed to org room
        expect(io.to).toHaveBeenCalledWith("org:5");
        expect(io.to().emit).toHaveBeenCalledWith("jobs:changed");
        // should not assign employees
        expect(Jobs.assignEmployeesToJob).not.toHaveBeenCalled();
    });

    test("assigns employees when employeeIds present", async () => {
        Jobs.mockImplementation(() => ({
        addJob: jest.fn().mockResolvedValue({ affectedRows: 1, insertId: 88 }),
        }));
        Jobs.assignEmployeesToJob.mockResolvedValue({ affectedRows: 2 });

        const io = makeIo();
        const req = {
        user: { orgId: 9 },
        body: {
            jobid: "123",
            employeeIds: [2, 3],
        },
        app: { get: jest.fn().mockReturnValue(io) },
        };
        const res = makeRes();

        await addJob(req, res);

        expect(Jobs.assignEmployeesToJob).toHaveBeenCalledWith(88, [2, 3]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("returns 500 if assigning employees fails", async () => {
        Jobs.mockImplementation(() => ({
        addJob: jest.fn().mockResolvedValue({ affectedRows: 1, insertId: 99 }),
        }));
        Jobs.assignEmployeesToJob.mockResolvedValue({ affectedRows: 0 });

        const req = {
        user: { orgId: 1 },
        body: { jobid: "123", employeeIds: [7] },
        app: { get: jest.fn() },
        };
        const res = makeRes();

        await addJob(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
        error: "Failed to assign employees to the job, please try again later.",
        });
    });

    test("returns 409 when DB throws duplicate error", async () => {
        const dupErr = new Error("dup");
        dupErr.code = "ER_DUP_ENTRY";

        Jobs.mockImplementation(() => ({
        addJob: jest.fn().mockRejectedValue(dupErr),
        }));

        const req = {
        user: { orgId: 1 },
        body: { jobid: "123", employeeIds: [] },
        app: { get: jest.fn() },
        };
        const res = makeRes();

        await addJob(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
        error: "Job ID already exists for this company.",
        });
    });

    test("returns 500 on unexpected error", async () => {
        Jobs.mockImplementation(() => ({
        addJob: jest.fn().mockRejectedValue(new Error("boom")),
        }));

        const req = {
        user: { orgId: 1 },
        body: { jobid: "123", employeeIds: [] },
        app: { get: jest.fn() },
        };
        const res = makeRes();

        await addJob(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
