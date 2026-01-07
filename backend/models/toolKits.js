const db = require('../util/database');

module.exports = class toolKits {
    constructor(name) {
        this.name = name;
    };

    static getAllToolKits(org_id) {
        return db.execute('SELECT * FROM toolKits WHERE org_id = ?', [org_id]);
    }
    static deleteToolKit(org_id, id) {
        return db.execute('DELETE FROM toolKits WHERE org_id = ? AND id = ?', [org_id, id]);
    }
}