// _tests_/loggedin.routes.wiring.test.js
const request = require('supertest');
const express = require('express');

// 1) Mock auth to be a no-op (so routes always pass through)
//    Also keep a spy so we can assert the correct roles were configured.
const requireRoleMock = jest.fn((..._roles) => (req, res, next) => next());
jest.mock('../../../middleware/auth', () => ({
  requireRole: (...roles) => requireRoleMock(...roles),
}));

// 2) Mock ALL controller handlers as simple no-op responders
const mockHandlers = {
  getIndex:               jest.fn((req, res) => res.status(200).send('getIndex')),
  jobsPage:               jest.fn((req, res) => res.status(200).send('jobsPage')),
  postAddJob:             jest.fn((req, res) => res.status(201).send('postAddJob')),
  postEditJob:            jest.fn((req, res) => res.status(200).send('postEditJob')),
  jobDetailsPage:         jest.fn((req, res) => res.status(200).send('jobDetailsPage')),
  editJobPage:            jest.fn((req, res) => res.status(200).send('editJobPage')),
  removeEmployeeFromJob:  jest.fn((req, res) => res.status(200).send('removeEmployeeFromJob')),
  deleteJob:              jest.fn((req, res) => res.sendStatus(204)),
  manageEmployees:        jest.fn((req, res) => res.status(200).send('manageEmployees')),
  editEmployeePage:       jest.fn((req, res) => res.status(200).send('editEmployeePage')),
  postEditEmployee:       jest.fn((req, res) => res.status(200).send('postEditEmployee')),
  addEmployee:            jest.fn((req, res) => res.status(200).send('addEmployee')),
  postAddEmployee:        jest.fn((req, res) => res.status(201).send('postAddEmployee')),
  postLogout:             jest.fn((req, res) => res.status(200).send('postLogout')),
};
jest.mock('../controllers/loggedin', () => mockHandlers);

// 3) Now require the real router (it will use the mocked auth + controllers)
const router = require('../../../routes/loggedin');

// helper to mount the router on an app
function makeApp() {
  const app = express();
  app.use(express.json());
  // fake session so your middleware could read something if needed
  app.use((req, _res, next) => {
    req.session = { role: 'manager', loginid: 123, companyname: 'TestCo', employeename: 'Rick' };
    next();
  });
  app.use('/loggedin', router);
  return app;
}

describe('loggedin router wiring', () => {
  let app;
  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  // --- Basic mapping tests: path+method -> correct controller

  test('GET /loggedin/ -> loggedinController.getIndex', async () => {
    const res = await request(app).get('/loggedin/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('getIndex');
    expect(mockHandlers.getIndex).toHaveBeenCalledTimes(1);
  });

  test('GET /loggedin/jobs -> loggedinController.jobsPage', async () => {
    const res = await request(app).get('/loggedin/jobs');
    expect(res.status).toBe(200);
    expect(res.text).toBe('jobsPage');
    expect(mockHandlers.jobsPage).toHaveBeenCalledTimes(1);
  });

  test('POST /loggedin/post-addJob -> loggedinController.postAddJob', async () => {
    const res = await request(app).post('/loggedin/post-addJob').send({ title: 'X' });
    expect(res.status).toBe(201);
    expect(res.text).toBe('postAddJob');
    expect(mockHandlers.postAddJob).toHaveBeenCalledTimes(1);
  });

  test('POST /loggedin/post-editJob/:id -> loggedinController.postEditJob', async () => {
    const res = await request(app).post('/loggedin/post-editJob/42').send({ title: 'Y' });
    expect(res.status).toBe(200);
    expect(mockHandlers.postEditJob).toHaveBeenCalledTimes(1);
    // (Optional) verify params made it to handler:
    const firstCallReq = mockHandlers.postEditJob.mock.calls[0][0];
    expect(firstCallReq.params.id).toBe('42');
  });

  test('GET /loggedin/job-details/:id -> loggedinController.jobDetailsPage', async () => {
    const res = await request(app).get('/loggedin/job-details/abc');
    expect(res.status).toBe(200);
    expect(res.text).toBe('jobDetailsPage');
    expect(mockHandlers.jobDetailsPage).toHaveBeenCalledTimes(1);
  });

  test('DELETE /loggedin/job/:id -> loggedinController.deleteJob', async () => {
    const res = await request(app).delete('/loggedin/job/99');
    expect(res.status).toBe(204);
    expect(mockHandlers.deleteJob).toHaveBeenCalledTimes(1);
  });

  test('POST /loggedin/logout -> loggedinController.postLogout', async () => {
    const res = await request(app).post('/loggedin/logout');
    expect(res.status).toBe(200);
    expect(res.text).toBe('postLogout');
    expect(mockHandlers.postLogout).toHaveBeenCalledTimes(1);
  });

  // --- Optional: assert the role wiring used in router definition
  test('requireRole configured correctly on key routes', async () => {
    // Router was required once; requireRole should have been called for each guarded route:
    //   /jobs, /post-addJob, /post-editJob/:id, /edit-job/:id, /job/:id,
    //   /manageEmployees, /edit-employee/:id, /post-editEmployee/:id,
    //   /addEmployeePage, /post-addEmployee
    // Check a few representative ones:
    expect(requireRoleMock).toHaveBeenCalledWith('owner', 'manager'); // e.g., for /jobs, /post-addJob, etc.
    expect(requireRoleMock).toHaveBeenCalledWith('owner');            // e.g., manageEmployees, addEmployee...
  });
});
