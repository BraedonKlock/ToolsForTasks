const db = require('../util/database');

module.exports = class employee {
    constructor(name, role, employeeID, email, password, avatar, orgID, companyName) {
        this.name = name;
        this.role = role;
        this.employeeID = employeeID;
        this.email = email;
        this.password = password;
        this.avatar = avatar;
        this.orgID = orgID;
        this.companyName = companyName;
    }
    static findEmployee(employeeEmail) {
        return db.execute('SELECT * FROM employees WHERE email = ?',[employeeEmail]);
    };
    static getAllEmployeesByOrg(orgId) {
        return db.execute('SELECT * FROM employees WHERE org_id = ?', [orgId]);
    };
    static findEmployeesforJob(jobId) {
        const sql = `
        SELECT
        e.employeeid AS employeeid,
        e.id AS id,
        e.name       AS name,
        e.role       AS role
        FROM job_employees AS je
        INNER JOIN employees AS e
        ON e.id = je.employee_id
        WHERE je.job_id = ?;
        `;
        return db.execute(sql, [jobId]);
    };

    static deleteEmployeeFromOrg(orgId, employeeId) {
        return db.execute('DELETE from employees WHERE org_id = ? AND id = ?', [orgId, employeeId]);
    };

    async addEmployee() {
        const [result] = await db.execute('INSERT INTO employees (name,employeeid,role,email,password,avatar,org_id,companyName) VALUES (?,?,?,?,?,?,?,?)', [this.name,this.employeeID,this.role,this.email,this.password,this.avatar,this.orgID, this.companyName]);
        return result;
    };
    /**This method finds an employee by their employee id.
     * I use this for the editEmployeePage when i pass in the employees id in the URL params
     */
    static findEmployeeById( orgid, employeeid) {
        return db.execute('SELECT id, employeeid, name, role, email, avatar, org_id, companyName FROM employees WHERE org_id = ? AND id = ?', [orgid, employeeid]).then(([rows]) => { // returns a promise which is a 2d array. getting the first index where the job details are stored
                if (!rows || rows.length === 0) {
                    const err = new Error();
                    err.status = 404;
                    throw err;
                }
                return rows
        });
    };
    static async updateEmployee(orgid, id, name, role, employeeid, email, password, avatar) {
        if (password) {
            const [result] = await db.execute(
            `UPDATE employees
            SET employeeid = ?, name = ?, role = ?, email = ?, avatar = ?, password = ?
            WHERE org_id = ? AND id = ?`,
            [employeeid, name, role, email, avatar, password, orgid, id]
            );
            return result;
        } else {
            const [result] = await db.execute(
            `UPDATE employees
            SET employeeid = ?, name = ?, role = ?, email = ?, avatar = ?
            WHERE org_id = ? AND id = ?`,
            [employeeid, name, role, email, avatar, orgid, id]
            );
            return result;
        }
    }
}