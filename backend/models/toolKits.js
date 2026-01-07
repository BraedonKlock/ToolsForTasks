const db = require('../util/database');

module.exports = class toolKits {
    constructor(name) {
        this.name = name;
    };

    static getAllToolKits(org_id) {
        return db.execute('SELECT * FROM toolkits WHERE org_id = ?', [org_id]);
    }
}