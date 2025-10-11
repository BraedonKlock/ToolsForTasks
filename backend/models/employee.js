const db = require('../util/database');

module.exports = class employee {
    constructor(name, role, employeeID, email, password, orgID) {
        this.name = name;
        this.role = role;
        this.employeeID = employeeID;
        this.email = email;
        this.password = password;
        this.orgID = orgID;
    }
    save() {
        return db.execute('INSERT INTO employees (name,employeeid,role,email,password,org_id) VALUES (?,?,?,?,?,?)', [this.name,this.employeeID,this.role,this.email,this.password,this.orgID]);
    };

    static getAllByOrg(orgid) {
        return db.execute('SELECT * FROM employees WHERE org_id = ?', [orgid]);
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

    /**This method is used to find the employee ids associated to a job
     * used in the DELETE DELETE JOB controller
     */
    static findEmployeesforJob(jobid) {
        return db.execute('SELECT * FROM job_employees WHERE job_id = ?', [jobid]);
    };

    static findDbIdByEmployeeid(orgId, employeeid) {
    return db.execute('SELECT id FROM employees WHERE org_id = ? AND employeeid = ? LIMIT 1',[orgId, employeeid])
    .then(([rows]) => rows.length ? rows[0].id : null);
    };
}