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
    createAccount() {
        return db.execute('INSERT INTO organizations (businessType, companyName, email, password, role) VALUES (?, ?, ?, ?,?)', [this.type, this.name, this.email, this.password, this.role]); // returns a promise
    }

    /**This utility function finds a user by their unique email */
    static findUser(userEmail) {
        return db.execute('SELECT * FROM organizations WHERE email = ?', [userEmail]); // returns a promise
    }

    static findUserById(org_id) {
        return db.execute(
            "SELECT id, businessType, companyName, email FROM organizations WHERE id = ?", [org_id]
        );
    }

    static async updateUser(org_id, type, name, email, password) {
        if(password) {
            const [result] = await db.execute('UPDATE organizations SET businessType = ?, companyName = ?, email = ?, password = ? WHERE id = ?', [type, name, email, password, org_id])
            return result;
        } else {
            const [result] = await db.execute('UPDATE organizations SET businessType = ?, companyName = ?, email = ? WHERE id = ?', [type, name, email, org_id])
            return result;
        }
    }
}