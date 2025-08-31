const db = require('../util/database');

module.exports = class user {
    constructor (type,name,email,password) {
        this.type = type;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    save() {
        const email = this.email.trim().toLowerCase();
        const password = this.password.trim();
        return db.execute('INSERT INTO organizations (businessType, companyName, email, password) VALUES (?, ?, ?, ?)', [this.type, this.name, this.email, this.password]);
    }

    static findUser(userEmail) {
        return db.execute('SELECT * FROM organizations WHERE email = ?', [userEmail]);
    }
}