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
        
    }

    static getAllByOrg(orgid) {
        return db.execute('SELECT * FROM employees WHERE org_id = ?', [orgid]);
    }

    static findEmployee(employeeEmail) {
        return db.execute('SELECT * FROM employees WHERE email = ?',[employeeEmail]);
    }

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
    }

}