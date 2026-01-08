/**This is the user class / object */
const db = require('../util/database');

module.exports = class user {
    constructor(name, email, password, role = "owner") {
        this.name = name;         // companyName
        this.email = email;
        this.password = password;
        this.role = role;
    }

    /**This method saves an OWNER account to the database */
    async createAccount() {
        // Insert into accounts (owner)
        const [result] = await db.execute(
        `INSERT INTO accounts (companyName, email, password, role, account_type)
        VALUES (?, ?, ?, ?, 'owner')`,
        [this.name, this.email, this.password, this.role]
        );

        // Ensure org_id = id for owners
        await db.execute(
        `UPDATE accounts SET org_id = id WHERE id = ?`,
        [result.insertId]
        );

        return result;
    }

    static findAccountByEmail(email) {
    return db.execute(
        `SELECT id, email, password, role, companyName, org_id, employee_id, account_type
        FROM accounts
        WHERE email = ?
        LIMIT 2`,
        [email]
    );
    }

    static findUser(userEmail) {
        return db.execute(
        `SELECT *
        FROM accounts
        WHERE email = ? AND account_type = 'owner'
        LIMIT 1`,
        [userEmail]
        );
    }


    static findAccountByEmailAndType(email, accountType) {
        return db.execute(
        `SELECT id, email, password, role, companyName, org_id, employee_id, account_type
        FROM accounts
        WHERE email = ? AND account_type = ?
        LIMIT 1`,
        [email, accountType]
        );
    }

    static findUserById(org_id) {
        return db.execute(
        `SELECT id, companyName, email
        FROM accounts
        WHERE org_id = ? AND account_type = 'owner'
        LIMIT 1`,
        [org_id]
        );
    }

    static async updateUser(org_id, name, email, password) {
        if (password) {
        const [result] = await db.execute(
            `UPDATE accounts
            SET companyName = ?, email = ?, password = ?
            WHERE org_id = ? AND account_type = 'owner'`,
            [name, email, password, org_id]
        );
        return result;
        } else {
        const [result] = await db.execute(
            `UPDATE accounts
            SET companyName = ?, email = ?
            WHERE org_id = ? AND account_type = 'owner'`,
            [name, email, org_id]
        );
        return result;
        }
    }
};
