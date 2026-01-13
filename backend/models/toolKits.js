const db = require('../util/database');

module.exports = class toolKits {
    constructor(name) {
        this.name = name;
    };

    static getAllToolKits(org_id) {
        return db.execute('SELECT * FROM toolkits WHERE org_id = ? ORDER BY name ASC', [org_id]);
    }
    static deleteToolKit(org_id, id) {
        return db.execute('DELETE FROM toolKits WHERE org_id = ? AND id = ?', [org_id, id]);
    }
    static getToolKitTools(toolKitId) {
    return db.execute(
        `
        SELECT
        tt.toolkit_id,
        tt.tool_id,
        tt.quantity,
        t.name AS tool_name
        FROM toolkit_tools tt
        JOIN tools t ON t.id = tt.tool_id
        WHERE tt.toolkit_id = ?
        ORDER BY t.name
        `,
        [toolKitId]
    );
    }
    static addToolKit(org_id, name) {
        return db.execute('INSERT INTO toolkits (name, org_id) VALUES (?,?)', [name, org_id])
    }

    static addToolsToToolKit(toolkitId, toolId, quantity) {
        return db.execute(
            "INSERT INTO toolkit_tools (toolkit_id, tool_id, quantity) VALUES (?,?,?)",
            [toolkitId, toolId, quantity]
        );
    }
}