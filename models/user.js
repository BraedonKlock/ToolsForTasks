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
        return db.execute('INSERT INTO organizations (businessType, companyName, email, password) VALUES (?, ?, ?, ?)', [this.type, this.name, this.email, this.password]);
    }
}