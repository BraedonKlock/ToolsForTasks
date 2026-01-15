describe("Tools page (mobile)", () => {
    beforeEach(() => {
        cy.viewport("iphone-x");
        cy.visit("/login");

        cy.get('input[name="email"]').type("rick@ricksroofing.com");
        cy.get('input[name="password"]').type("123");
        cy.get('button[type="submit"]').click();

        cy.url().should("include", "/loggedIn");

        cy.visit("/loggedIn/tools");
    });

    it("adds a tool kit with tools, edits it, and deletes it", () => {
        const toolName1 = `Cypress Tool A`;
        const toolName2 = `Cypress Tool B`;
        const toolKitName = `Cypress Kit`;

        // Add tool 1
        cy.get('a[href="/loggedIn/add-tool"]').should("be.visible").click();
        cy.get('input[name="name"]').type(toolName1);
        cy.get("#addToolPage-addBtn").click();
        cy.url({ timeout: 10000 }).should("include", "/loggedIn/tools");
        cy.contains(".tool-card__title", toolName1, { timeout: 10000 }).should("exist");

        // Add tool 2
        cy.get('a[href="/loggedIn/add-tool"]').should("be.visible").click();
        cy.get('input[name="name"]').type(toolName2);
        cy.get("#addToolPage-addBtn").click();
        cy.url({ timeout: 10000 }).should("include", "/loggedIn/tools");
        cy.contains(".tool-card__title", toolName2, { timeout: 10000 }).should("exist");

        // Add tool kit with tool 1
        cy.get('a[href="/loggedIn/add-tool-Kit"]').should("be.visible").click();
        cy.get('input[name="name"]').type(toolKitName);
        cy.contains(".addToolKitPage-toolRow", toolName1, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.contains("button", "Select").click();
            });
        cy.get(".addToolKitPage-submitBtn").click();

        cy.url({ timeout: 10000 }).should("include", "/loggedIn/tools");
        cy.contains(".kit-card", toolKitName, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.contains(toolName1, { timeout: 10000 }).should("exist");
            });

        // Edit tool kit to add tool 2
        cy.contains(".kit-card", toolKitName, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.get(".three-dot-menu-icon").click();
                cy.get('a[href^="/loggedIn/edit-tool-kit/"]').click();
            });

        cy.url().should("include", "/loggedIn/edit-tool-kit/");
        cy.contains(".editToolKitPage-toolRow", toolName2, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.contains("button", "Select").click();
            });
        cy.get(".editToolKitPage-submitBtn").click();

        cy.url({ timeout: 10000 }).should("include", "/loggedIn/tools");
        cy.contains(".kit-card", toolKitName, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.contains(toolName2, { timeout: 10000 }).should("exist");
            });

        // Delete tool kit
        cy.contains(".kit-card", toolKitName, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.get(".three-dot-menu-icon").click();
                cy.get("button.delete-btn").click();
            });

        cy.contains(".kit-card", toolKitName, { timeout: 10000 }).should("not.exist");

        // Delete tools created for the tool kit
        cy.contains(".tool-card", toolName1, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.get(".three-dot-menu-icon").click();
                cy.get("button.delete-btn").click();
            });
        cy.contains(".tool-card__title", toolName1, { timeout: 10000 }).should("not.exist");

        cy.contains(".tool-card", toolName2, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.get(".three-dot-menu-icon").click();
                cy.get("button.delete-btn").click();
            });
        cy.contains(".tool-card__title", toolName2, { timeout: 10000 }).should("not.exist");
    });

    it("adds a tool, edits it, and deletes it", () => {
        const toolName = `Cypress Tool ${Date.now()}`;
        const updatedToolName = `${toolName} Updated`;

        // Add tool
        cy.get('a[href="/loggedIn/add-tool"]').should("be.visible").click();
        cy.get('input[name="name"]').type(toolName);
        cy.get("#addToolPage-addBtn").click();
        cy.url({ timeout: 10000 }).should("include", "/loggedIn/tools");
        cy.contains(".tool-card__title", toolName, { timeout: 10000 }).should("exist");

        // Edit tool
        cy.contains(".tool-card", toolName, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.get(".three-dot-menu-icon").click();
                cy.get('a[href^="/loggedIn/edit-tool/"]').click();
            });

        cy.url().should("include", "/loggedIn/edit-tool/");
        cy.get('input[name="name"]').clear().type(updatedToolName);
        cy.get("#editToolPage-editBtn").click();

        cy.url({ timeout: 10000 }).should("include", "/loggedIn/tools");
        cy.contains(".tool-card__title", updatedToolName, { timeout: 10000 }).should("exist");

        // Delete tool
        cy.contains(".tool-card", updatedToolName, { timeout: 10000 })
            .should("be.visible")
            .within(() => {
                cy.get(".three-dot-menu-icon").click();
                cy.get("button.delete-btn").click();
            });

        cy.contains(".tool-card__title", updatedToolName, { timeout: 10000 }).should("not.exist");
    });
});
