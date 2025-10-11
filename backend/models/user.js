/**This is the user class / object */
const db = require('../util/database');

module.exports = class user {
    constructor (type,name,email,password, role = "owner") {
        this.type = type;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role
    }

    /**This method saves a user to the database */
    save() {
        const email = this.email.trim().toLowerCase(); // triming email and setting to lowercase
        const password = this.password.trim(); // triming password 
        return db.execute('INSERT INTO organizations (businessType, companyName, email, password, role) VALUES (?, ?, ?, ?,?)', [this.type, this.name, this.email, this.password, this.role]); // returns a promise
    }

    /**This utility function finds a user by their unique email */
    static findUser(userEmail) {
        return db.execute('SELECT * FROM organizations WHERE email = ?', [userEmail]); // returns a promise
    }

    static findUserbyId(org_id) {
        return db.execute('SELECT * FROM organizations WHERE id = ?', [org_id]);
    }
}