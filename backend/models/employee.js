const db = require('../util/database');

module.exports = class employee {
    constructor(name, role, employeeID, email, password, avatar, orgID) {
        this.name = name;
        this.role = role;
        this.employeeID = employeeID;
        this.email = email;
        this.password = password;
        this.avatar = avatar;
        this.orgID = orgID;
    }
    
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












save() {
    return db.execute('INSERT INTO employees (name,employeeid,role,email,password,org_id) VALUES (?,?,?,?,?,?)', [this.name,this.employeeID,this.role,this.email,this.password,this.orgID]);
};
    static findEmployee(employeeEmail) {
        return db.execute('SELECT * FROM employees WHERE email = ?',[employeeEmail]);
    };

    static findDbIdsByEmails(orgid, emails) {
        // re-mapping my emails array to sql query format because i dont know how many emails there are
        const placeholders = emails.map(() => '?').join(', ');
        // using re-mapped array and storing it in a variable
        const query = `SELECT id FROM employees WHERE org_id = ? AND email IN (${placeholders})`;
        return db.execute(query, [orgid, ...emails]) // executing the sql code and passing in the data
            .then(function(result) {
                const rows = result[0]; // Get the first item from the result array
                const ids = [];

                for (let i = 0; i < rows.length; i++) {
                    ids.push(rows[i].id); // Add each row's id to the ids array
                }
                
                return ids; // Return the array of ids
            });
    };

    /**This method finds an employee by their employee id.
     * I use this for the editEmployeePage when i pass in the employees id in the URL params
     */
    static findEmployeeById( orgid, employeeid) {
        return db.execute('SELECT * FROM employees WHERE org_id = ? AND id = ?', [orgid, employeeid]);
    };

    static updateEmployee(dbid,employeeid,name,role,email,orgid) {
        return db.execute('UPDATE employees SET employeeid = ?, name = ?, role = ?, email = ? WHERE org_id = ? AND id = ?', [employeeid, name, role, email,orgid, dbid]);
    };



    static findDbIdByEmployeeid(orgId, employeeid) {
    return db.execute('SELECT id FROM employees WHERE org_id = ? AND employeeid = ? LIMIT 1',[orgId, employeeid])
    .then(([rows]) => rows.length ? rows[0].id : null);
    };
}