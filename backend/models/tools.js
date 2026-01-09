const db = require('../util/database');

module.exports = class tools {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    };

    static getAllTools(org_id) {
        return db.execute('SELECT * FROM tools WHERE org_id = ?', [org_id]);
    }
    static deleteTool(org_id, id) {
        return db.execute('DELETE FROM tools WHERE org_id = ? AND id = ?', [org_id, id]);
    }
    static addTool(name, quantity, org_id) {
        return db.execute('INSERT INTO tools (name, quantity, org_id) VALUES (?,?,?)', [name, quantity, org_id]);
    }
    static getTool(org_id, toolId) {
        return db.execute('SELECT * FROM tools WHERE org_id = ? and id = ?', [org_id, toolId])
    }
    static updateTool(name, org_id, toolId) {
        return db.execute('UPDATE tools SET name = ? WHERE org_id = ? AND id = ?', [name, org_id, toolId])
    }
}