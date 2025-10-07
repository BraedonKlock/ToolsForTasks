const { editEmployeePage } = require('../../../controllers/loggedin');
const Employees = require('../../../models/employee');

jest.mock('../../../models/employee'); // mock DB call

describe('editEmployeePage', () => {
  it('should render error page when employee not found (404)', async () => {
    const req = {
      session: { companyname: 'TestCo', org: 1 },
      params: { id: 999 },
      query: {}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn()
    };

    // Simulate no employee found
    Employees.findEmployeeById.mockResolvedValue([[]]);

    await editEmployeePage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.render).toHaveBeenCalledWith('error', {
      pageTitle: 'Employee not found',
      message: 'Could not find employee'
    });
  });
});
