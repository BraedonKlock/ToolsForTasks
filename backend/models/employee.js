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
        const sql = `
        SELECT
          e.*,
          a.email AS email,
          a.password AS password,
          a.role AS role,
          a.org_id AS org_id,
          a.companyName AS companyName
        FROM accounts a
        INNER JOIN employees e
          ON e.id = a.employee_id
        WHERE a.email = ? AND a.account_type = 'employee'
        LIMIT 1
        `;
        return db.execute(sql, [employeeEmail]);
    };

    static getAllEmployeesByOrg(orgId) {
        const sql = `
        SELECT
          e.id,
          e.employeeid,
          e.name,
          e.role,
          a.email,
          e.avatar,
          e.org_id,
          e.companyName
        FROM employees e
        LEFT JOIN accounts a
          ON a.employee_id = e.id AND a.account_type = 'employee'
        WHERE e.org_id = ? ORDER BY name ASC
        `;
        return db.execute(sql, [orgId]);
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
        WHERE je.job_id = ? ORDER BY name ASC
        `;
        return db.execute(sql, [jobId]);
    };

    static deleteEmployeeFromOrg(orgId, employeeId) {
        return db.execute('DELETE from employees WHERE org_id = ? AND id = ?', [orgId, employeeId]);
    };

    async addEmployee() {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [empResult] = await conn.execute(
                'INSERT INTO employees (name,employeeid,role,avatar,org_id,companyName) VALUES (?,?,?,?,?,?)',
                [this.name, this.employeeID, this.role, this.avatar, this.orgID, this.companyName]
            );

            const employeeDbId = empResult.insertId;

            await conn.execute(
                `INSERT INTO accounts (email, password, role, companyName, account_type, employee_id, org_id)
                 VALUES (?, ?, ?, ?, 'employee', ?, ?)`,
                [this.email, this.password, this.role, this.companyName, employeeDbId, this.orgID]
            );

            await conn.commit();
            return empResult;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    };

    static findEmployeeById(orgid, employeeid) {
        const sql = `
        SELECT
          e.id,
          e.employeeid,
          e.name,
          e.role,
          a.email,
          e.avatar,
          e.org_id,
          e.companyName
        FROM employees e
        LEFT JOIN accounts a
          ON a.employee_id = e.id AND a.account_type = 'employee'
        WHERE e.org_id = ? AND e.id = ?
        `;
        return db.execute(sql, [orgid, employeeid]).then(([rows]) => {
                if (!rows || rows.length === 0) {
                    const err = new Error();
                    err.status = 404;
                    throw err;
                }
                return rows
        });
    };

    static async updateEmployee(orgid, id, name, role, employeeid, email, password, avatar) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [empResult] = await conn.execute(
                `UPDATE employees
                 SET employeeid = ?, name = ?, role = ?, avatar = ?
                 WHERE org_id = ? AND id = ?`,
                [employeeid, name, role, avatar, orgid, id]
            );

            if (password) {
                await conn.execute(
                    `UPDATE accounts
                     SET email = ?, role = ?, password = ?
                     WHERE org_id = ? AND employee_id = ? AND account_type = 'employee'`,
                    [email, role, password, orgid, id]
                );
            } else {
                await conn.execute(
                    `UPDATE accounts
                     SET email = ?, role = ?
                     WHERE org_id = ? AND employee_id = ? AND account_type = 'employee'`,
                    [email, role, orgid, id]
                );
            }

            await conn.commit();
            return empResult;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
}
