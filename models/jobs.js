const db = require('../util/database');

module.exports = class jobs {
    constructor(jobType,id, title, date, address, phoneNumber, notes) {
        this.jobType = jobType
        this.id = id,
        this.title = title,
        this.date = date,
        this.address = address,
        this.phoneNumber = phoneNumber,
        this.notes = notes
    }
    save() {
        return db.execute('INSERT INTO jobs (jobType,id,title,date,address,phoneNumber,notes) VALUES (?,?,?,?,?,?,?)',
        [this.jobType,this.id, this.title, this.date, this.address, this.phoneNumber, this.notes]
        );
    }

    static getAllJobs() {
        return db.execute('SELECT * FROM jobs ORDER BY date ASC');
    }

    static findJobById(id) {
        return db.execute('SELECT * FROM jobs WHERE id = ? ', [id])
    }
};
