describe("Jobs page (mobile)", () => {
    beforeEach(() => {
        cy.viewport("iphone-x");
        cy.visit("/login");

        cy.get("#loginForm-accountType").select("owner");
        cy.get('input[name="email"]').type("rick@ricksroofing.com");
        cy.get('input[name="password"]').type("123");
        cy.get('button[type="submit"]').click();

        cy.url().should("include", "/loggedIn");

        cy.visit("/loggedIn/manage-employees");
    });

    it("adds an employee", () => {
        cy.get("#addEmployee-image").should("be.visible").click();
        cy.url().should("include", "/loggedIn/add-employee");
        cy.get("#avatarPicker").select("1");
        cy.get("#employeeid").type("1515");
        cy.get("#name").type("Test");
        cy.get("#addEmployeePage-roleSelect").select("manager");
        cy.get("#email").type("test@hotmail.com");
        cy.get("#password").type("123");
        cy.get("#addEmployeePage-addBtn").click();

        cy.url().should("include", "/loggedIn/manage-employee");

        cy.contains("Test");
    })

    it("fails to add employee when duplicate email exists and displays the correct error message ", () => {
        cy.get("#addEmployee-image").should("be.visible").click();
        cy.url().should("include", "/loggedIn/add-employee");
        cy.get("#avatarPicker").select("1");
        cy.get("#employeeid").type("1515");
        cy.get("#name").type("Test");
        cy.get("#addEmployeePage-roleSelect").select("manager");
        cy.get("#email").type("test@hotmail.com");
        cy.get("#password").type("123");
        cy.get("#addEmployeePage-addBtn").click();

        cy.url().should("include", "/loggedIn/add-employee");
        cy.get("#error").should("have.text", "Email already exists for this company.")
    })

    it("edits Test employee and changes the name to Test Edited", () => {
        cy.url().should("include", "/loggedIn/manage-employees");

        cy.contains(".employee-card", "Test", { timeout: 10000 })
            .should("exist")
            .as("testCard");

        cy.get("@testCard").within(() => {
            cy.get(".three-dot-menu-icon").click();
            cy.get('a[href^="/loggedIn/edit-employee/"]').click();
        });

        cy.url().should("include", "/loggedIn/edit-employee/");


        cy.get("#name").clear().type("Test Edited");

        cy.contains("button", /update|save/i).click();

        cy.url({ timeout: 10000 }).should("include", "/loggedIn/manage-employees");
        cy.contains(".employee-card", "Test Edited", { timeout: 10000 }).should("exist");
    })

    it("deletes Test Edited employee", () => {
        cy.url().should("include", "/loggedIn/manage-employees");

        cy.contains(".employee-card", "Test Edited", { timeout: 10000 })
            .should("exist")
            .as("editedCard");

        cy.get("@editedCard").within(() => {
            cy.get(".three-dot-menu-icon").click();
            cy.get("button.deleteJob-btn").click(); // this is your delete button class
        });

        cy.contains(".employee-card", "Test Edited", { timeout: 10000 })
            .should("not.exist");
    });
})