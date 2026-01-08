describe("Jobs page (mobile)", () => {
    beforeEach(() => {
        cy.viewport("iphone-x");
        cy.visit("/login");

        cy.get('input[name="email"]').type("rick@ricksroofing.com");
        cy.get('input[name="password"]').type("123");
        cy.get('button[type="submit"]').click();

        cy.url().should("include", "/loggedIn");

        cy.visit("/loggedIn/jobs");
    });

    it("adds a job and assigns Braedon Klock", () => {
        cy.get('a[href="/loggedIn/add-job"]').should("be.visible").click();
        cy.url().should("include", "/loggedIn/add-job");

        cy.get("#addJobForm-jobType").select("roofing");
        cy.get('input[name="jobid"]').type("123");
        cy.get('input[name="title"]').type("Test Job");
        cy.get('input[name="date"]').type("2026-01-03");
        cy.get('input[name="address"]').type("123 Main St");
        cy.get('input[name="phoneNumber"]').type("5555555555");
        cy.get('textarea[name="notes"]').type("Cypress test job");

        cy.contains("#addJob-employeeSelect option", "Braedon Klock", { timeout: 10000 })
        .should("exist");


        cy.get("#addJob-employeeSelect").select("2");

        cy.get("#addJob-addEmployeeBtn").click();

        // Confirm the employee pill appears
        cy.get(".employee-pill").should("contain", "Braedon Klock");

        // Submit job
        cy.get("#addJob-addJobBtn").click();

        cy.url({ timeout: 10000 }).should("include", "/loggedIn/jobs");
        cy.contains("Test Job").should("exist");
    });

    it("fails to add a job when id is not an int and displays proper error message", () => {
        cy.get('a[href="/loggedIn/add-job"]').should("be.visible").click();
        cy.url().should("include", "/loggedIn/add-job");

        cy.get("#addJobForm-jobType").select("roofing");
        cy.get('input[name="jobid"]').type("JOB123");
        cy.get('input[name="title"]').type("Test Job");
        cy.get('input[name="date"]').type("2026-01-03");
        cy.get('input[name="address"]').type("123 Main St");
        cy.get('input[name="phoneNumber"]').type("5555555555");
        cy.get('textarea[name="notes"]').type("Cypress test job");

        cy.contains("#addJob-employeeSelect option", "Braedon Klock", { timeout: 10000 })
        .should("exist");


        cy.get("#addJob-employeeSelect").select("2");

        cy.get("#addJob-addEmployeeBtn").click();

        // Confirm the employee pill appears
        cy.get(".employee-pill").should("contain", "Braedon Klock");

        // Submit job
        cy.get("#addJob-addJobBtn").click();

        cy.get("#error").should("have.text", "jobid must be an integer")
    });

    it("fails to add a job when id already exists and displays proper error message", () => {
        cy.get('a[href="/loggedIn/add-job"]').should("be.visible").click();
        cy.url().should("include", "/loggedIn/add-job");

        cy.get("#addJobForm-jobType").select("roofing");
        cy.get('input[name="jobid"]').type("123");
        cy.get('input[name="title"]').type("Test Job");
        cy.get('input[name="date"]').type("2026-01-03");
        cy.get('input[name="address"]').type("123 Main St");
        cy.get('input[name="phoneNumber"]').type("5555555555");
        cy.get('textarea[name="notes"]').type("Cypress test job");

        cy.contains("#addJob-employeeSelect option", "Braedon Klock", { timeout: 10000 })
        .should("exist");


        cy.get("#addJob-employeeSelect").select("2");

        cy.get("#addJob-addEmployeeBtn").click();

        // Confirm the employee pill appears
        cy.get(".employee-pill").should("contain", "Braedon Klock");

        // Submit job
        cy.get("#addJob-addJobBtn").click();

        cy.get("#error").should("have.text", "Job ID already exists for this company.")
    });



    it("fails to edit job when giving the job a jobid that already exists and displays the proper error message", () => {
        cy.visit("/loggedIn/jobs");

        cy.contains(".job-card", "ID: 123", { timeout: 10000 })
            .should("exist")
            .as("jobCard");

        cy.get("@jobCard").within(() => {
            cy.get(".three-dot-menu-icon").click();
            cy.get("#editJobHref").click();
        });

        cy.url().should("include", "/loggedIn/edit-job/");


        cy.get('input[name="jobid"]').clear().type("151");

        cy.contains("button", /update/i).click();
        cy.get("#error").should("have.text", "Job ID already exists for this company.")
    });

    it("fails to edit job when there is no jobid and displays the proper error message", () => {
        cy.visit("/loggedIn/jobs");

        cy.contains(".job-card", "ID: 123", { timeout: 10000 })
            .should("exist")
            .as("jobCard");

        cy.get("@jobCard").within(() => {
            cy.get(".three-dot-menu-icon").click();
            cy.get("#editJobHref").click();
        });

        cy.url().should("include", "/loggedIn/edit-job/");


        cy.get('input[name="jobid"]').clear().type(" ");

        cy.contains("button", /update/i).click();
        cy.get("#error").should("have.text", "jobid must be an integer")
    });

    it("edits jobid from 123 to 12", () => {
        cy.visit("/loggedIn/jobs");

        cy.contains(".job-card", "ID: 123", { timeout: 10000 })
            .should("exist")
            .as("jobCard");

        cy.get("@jobCard").within(() => {
            cy.get(".three-dot-menu-icon").click();
            cy.get("#editJobHref").click();
        });

        cy.url().should("include", "/loggedIn/edit-job/");


        cy.get('input[name="jobid"]').clear().type("12");

        cy.contains("button", /update/i).click();

        // 6) Confirm we’re back on jobs page and the card shows ID: 12 (and not 123)
        cy.url({ timeout: 10000 }).should("include", "/loggedIn/jobs");
        cy.contains(".job-card", "ID: 12", { timeout: 10000 }).should("exist");
        cy.contains(".job-card", "ID: 123").should("not.exist");
    });

    it("deletes the job with jobid 12", () => {
        cy.visit("/loggedIn/jobs");

        cy.contains(".job-card", "ID: 12", { timeout: 10000 })
            .should("exist")
            .invoke("attr", "data-job-id")
            .then((jobDbId) => {
            expect(jobDbId, "db job id").to.exist;

        cy.get(`.job-card[data-job-id="${jobDbId}"]`).within(() => {
            cy.get(".three-dot-menu-icon").click();
            cy.get(`.delete-btn[data-job-id="${jobDbId}"]`).click();
        });

        // Confirm that specific card is removed from the DOM
        cy.get(`.job-card[data-job-id="${jobDbId}"]`, { timeout: 10000 }).should("not.exist");
        });
    });
});
