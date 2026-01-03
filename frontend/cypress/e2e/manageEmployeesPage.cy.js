describe("Jobs page (mobile)", () => {
    beforeEach(() => {
        cy.viewport("iphone-x");
        cy.visit("/login");

        cy.get("#loginForm-accountType").select("owner");
        cy.get('input[name="email"]').type("rick@ricksroofing.com");
        cy.get('input[name="password"]').type("123");
        cy.get('button[type="submit"]').click();

        cy.url().should("include", "/loggedIn");

        cy.visit("/loggedIn/jobs");
    });
    
})