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

    /**This method saves a job to the database*/
    save() {
        return db.execute(
        'INSERT INTO jobs (jobid, jobType, title, date, address, phoneNumber, notes, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [this.jobID, this.jobType, this.title, this.date, this.address, this.phoneNumber, this.notes, this.orgId]
        ).then(([result]) => result.id);
    }
    update(dbid) {
        return db.execute(
            `UPDATE jobs
            SET jobid = ?, jobType = ?, title = ?, date = ?, address = ?, phoneNumber = ?, notes = ?
            WHERE org_id = ? AND id = ?`,
            [this.jobID, this.jobType, this.title, this.date, this.address, this.phoneNumber, this.notes, this.orgId, dbid]
        );
    }

    static assignEmployees(jobDbId, employeeDbIds) {
        if (!employeeDbIds || !employeeDbIds.length) return Promise.resolve();

        const values = employeeDbIds.map(eid => [jobDbId, Number(eid)]);
        const placeholders = values.map(() => '(?, ?)').join(', ');
        const flatValues = values.flat(); // Flatten the array of pairs

        const query = `INSERT INTO job_employees (job_id, employee_id) VALUES ${placeholders}`;
        return db.execute(query, flatValues);
    }

    
    /**This utility function gets all the jobs from the database assigned to the user that logged in */
    static getAllJobs(loginID, role) {
        if (role === "owner" ) {
            return db.execute(
                `SELECT *
            FROM jobs
            WHERE org_id = ?
            ORDER BY \`date\` ASC`,
            [loginID]
        );
    }
    
    if (role === "crew"  || role === "manager" ) {
            console.log("running");
            return db.execute(
                `SELECT j.*
            FROM job_employees je
            JOIN jobs j ON j.id = je.job_id
            WHERE je.employee_id = ?
            ORDER BY j.\`date\` ASC`,
            [loginID]
        );
    }
    
    throw new Error('Invalid column name');
}

/**This utility function gets a job by its unique id used for job details */
static findJobById(orgId, id) {
    return db.execute('SELECT * FROM jobs WHERE org_id = ? AND jobid = ? ', [orgId, id]) // returns a promise
}

static findDbIdByJobid(orgId, jobId) {
    return db.execute(
        'SELECT id FROM jobs WHERE org_id = ? AND jobid = ? LIMIT 1',
        [orgId, jobId]
    ).then(([rows]) => rows.length ? rows[0].id : null);
}

static deleteJobById(orgid, jobid) {
    return db.execute('DELETE FROM jobs WHERE org_id = ? AND jobid = ?', [orgid, jobid]);
};

static removeEmployeeFromJob(jobDbId, employeeDbId) {
    return db.execute('DELETE FROM job_employees WHERE job_id = ? AND employee_id = ?',[jobDbId, employeeDbId]);
};
/** Remove a single employee from a job */
static removeEmployeeFromJob(jobDbId, employeeDbId) {
    return db.execute(
        'DELETE FROM job_employees WHERE job_id = ? AND employee_id = ?',
        [jobDbId, employeeDbId]
    );
}
};
