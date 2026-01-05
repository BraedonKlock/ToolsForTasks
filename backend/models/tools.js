const db = require('../util/database');

module.exports = class tools {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    };

    static getAllTools(org_id) {
        return db.execute('SELECT * FROM tools WHERE org_id = ?', [org_id]);
    }
    static deleteTool(org_id, name) {
        return db.execute('DELETE FROM tools WHERE org_id = ? AND name = ?', [org_id, name]);
    }
}