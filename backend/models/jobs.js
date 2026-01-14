/**Jobs class / object */

const db = require('../util/database');

module.exports = class jobs {
    constructor(jobType,jobID, title, date, address, phoneNumber, notes, orgId) {
        this.jobType = jobType,
        this.jobID = jobID,
        this.title = title,
        this.date = date,
        this.address = address,
        this.phoneNumber = phoneNumber,
        this.notes = notes,
        this.orgId = orgId
    }
    
    async addJob() {
        const [result] = await db.execute(
            'INSERT INTO jobs (jobid, jobType, title, date, address, phoneNumber, notes, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [this.jobID, this.jobType, this.title, this.date, this.address, this.phoneNumber, this.notes, this.orgId]
        )
        return result;
    }

    static getAllJobs(loginID, role) {
        if (role === "owner" ) {
            return db.execute(
            `SELECT 
                id, jobid, jobType, title,
                DATE_FORMAT(\`date\`, '%Y-%m-%d') AS \`date\`,
                address, phoneNumber, notes, org_id
            FROM jobs
            WHERE org_id = ?
            ORDER BY \`date\` ASC`,
            [loginID]
            );
        }
        
        if (role === "crew"  || role === "manager" ) {
            return db.execute(
            `SELECT 
                id, jobid, jobType, title,
                DATE_FORMAT(\`date\`, '%Y-%m-%d') AS \`date\`,
                address, phoneNumber, notes, org_id
            FROM jobs
            WHERE org_id = ?
            ORDER BY \`date\` ASC`,
            [loginID]
            );
        }
        
        throw new Error('Invalid column name');
    }

    static getJob(orgId, id) {
        return db.execute(
        `SELECT 
            id, jobid, jobType, title,
            DATE_FORMAT(\`date\`, '%Y-%m-%d') AS \`date\`,
            address, phoneNumber, notes, org_id
        FROM jobs
        WHERE org_id = ? AND id = ?`,
        [orgId, id]
        )
    }

    static assignEmployeesToJob(jobDbId, employeeDbIds) {
        const values = employeeDbIds.map(eid => [jobDbId, Number(eid)]);
        const placeholders = values.map(() => '(?, ?)').join(', ');
        const flatValues = values.flat();

        const query = `INSERT INTO job_employees (job_id, employee_id) VALUES ${placeholders}`;
        return db.execute(query, flatValues);
    }

    static deleteJobById(orgId, id) {
        return db.execute('DELETE FROM jobs WHERE org_id = ? AND id = ?', [orgId, id]);
    };
    
    static deleteEmployeeFromJob(jobDbId, employeeDbId) {
        return db.execute('DELETE FROM job_employees WHERE job_id = ? AND employee_id = ?',[jobDbId, employeeDbId]);
    };

    updateJob(dbJobId) {
        return db.execute(
            `UPDATE jobs
            SET jobid = ?, jobType = ?, title = ?, date = ?, address = ?, phoneNumber = ?, notes = ?
            WHERE org_id = ? AND id = ?`,
            [this.jobID, this.jobType, this.title, this.date, this.address, this.phoneNumber, this.notes, this.orgId, dbJobId]
        );
    }
}
