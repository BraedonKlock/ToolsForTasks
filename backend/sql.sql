CREATE TABLE job_employees (
    job_id INT NOT NULL,
    employee_id INT NOT NULL,

    PRIMARY KEY (job_id, employee_id),              -- prevents duplicates

    CONSTRAINT fk_job_employees_job
        FOREIGN KEY (job_id) 
        REFERENCES jobs(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_job_employees_employee
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
