/**This is the user class / object */
const db = require('../util/database');

module.exports = class user {
    constructor (name,email,password, role = "owner") {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role
    }

    /**This method saves a user to the database */
    createAccount() {
        return db.execute('INSERT INTO organizations (companyName, email, password, role) VALUES (?, ?, ?, ?)', [this.name, this.email, this.password, this.role]); // returns a promise
    }

    /**This utility function finds a user by their unique email */
    static findUser(userEmail) {
        return db.execute('SELECT * FROM organizations WHERE email = ?', [userEmail]); // returns a promise
    }

    static findUserById(org_id) {
        return db.execute(
            "SELECT id, companyName, email FROM organizations WHERE id = ?", [org_id]
        );
    }

    static async updateUser(org_id, name, email, password) {
        if(password) {
            const [result] = await db.execute('UPDATE organizations SET companyName = ?, email = ?, password = ? WHERE id = ?', [name, email, password, org_id])
            return result;
        } else {
            const [result] = await db.execute('UPDATE organizations SET companyName = ?, email = ? WHERE id = ?', [name, email, org_id])
            return result;
        }
    }
}
