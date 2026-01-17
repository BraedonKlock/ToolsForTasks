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
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.execute(
            `INSERT INTO accounts (companyName, email, password, role, account_type)
            VALUES (?, ?, ?, ?, 'owner')`,
            [this.name, this.email, this.password, this.role]
            );

            // Ensure org_id = id for owners
            await conn.execute(
            `UPDATE accounts SET org_id = id WHERE id = ?`,
            [result.insertId]
            );

            await conn.commit();
            return result;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
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

    /**
     * Store password reset token for an account
     * @param {string} email - account email
     * @param {string} token - reset token
     * @param {Date} expiry - token expiration time
     */
    static async storeResetToken(email, token, expiry) {
        const [result] = await db.execute(
            `UPDATE accounts
            SET password_reset_token = ?, password_reset_expiry = ?
            WHERE email = ?`,
            [token, expiry, email]
        );
        return result;
    }

    /**
     * Find account by reset token
     * @param {string} token - reset token
     */
    static findByResetToken(token) {
        return db.execute(
            `SELECT id, email, password_reset_expiry
            FROM accounts
            WHERE password_reset_token = ?
            LIMIT 1`,
            [token]
        );
    }

    /**
     * Update password and clear reset token
     * @param {string} email - account email
     * @param {string} passwordHash - new hashed password
     */
    static async updatePasswordAndClearToken(email, passwordHash) {
        const [result] = await db.execute(
            `UPDATE accounts
            SET password = ?, password_reset_token = NULL, password_reset_expiry = NULL
            WHERE email = ?`,
            [passwordHash, email]
        );
        return result;
    }

    /**
     * Clear expired reset tokens (cleanup utility)
     */
    static async clearExpiredTokens() {
        const [result] = await db.execute(
            `UPDATE accounts
            SET password_reset_token = NULL, password_reset_expiry = NULL
            WHERE password_reset_expiry < NOW()`
        );
        return result;
    }
};
