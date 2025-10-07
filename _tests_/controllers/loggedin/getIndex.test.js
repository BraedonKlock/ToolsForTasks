jest.mock('../../../models/jobs', () => ({
  getAllJobs: jest.fn(),
}));

// require the mocked module and the controller once
const Jobs = require('../../../models/jobs');
const { getIndex } = require('../../../controllers/loggedin');

describe('loggedin Controller - getIndex', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      session: {
        role: 'manager',
        loginid: 123,
        companyname: 'TestCo',
        employeename: 'Rick',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test('renders home page with jobs when successful', async () => {
    Jobs.getAllJobs.mockResolvedValue([[{ id: 1, job: 'Roofing' }]]);

    await getIndex(req, res, next);

    expect(Jobs.getAllJobs).toHaveBeenCalledWith(123, 'manager');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.render).toHaveBeenCalledWith(
      'home/index',
      expect.objectContaining({
        jobs: [{ id: 1, job: 'Roofing' }],
        pageTitle: 'Tools for Tasks - Home',
        path: '/loggedin',
        companyname: 'TestCo',
        employeename: 'Rick',
      })
    );
  });

  test('renders error page on failure', async () => {
    Jobs.getAllJobs.mockRejectedValue(new Error('DB error'));

    await getIndex(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({
        pageTitle: 'Server Error',
        message: 'Something went wrong while loading jobs.',
      })
    );
  });
});
