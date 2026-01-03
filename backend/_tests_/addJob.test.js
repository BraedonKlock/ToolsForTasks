const { addJob } = require("../controllers/loggedin"); // change path
const Jobs = require("../models/jobs"); // change path

jest.mock("../models/jobs", () => {
    const JobsMock = jest.fn();
    JobsMock.assignEmployeesToJob = jest.fn();
    return JobsMock;
});

const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
});

test("addJob returns 401 if req.user missing", async () => {
    const req = { user: null, body: {}, app: { get: jest.fn() } };
    const res = makeRes();

    await addJob(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "unauthenticated" });
});
