describe("Login (mobile)", () => {
  it("Account Type: owner - logs in successfully and redirects", () => {
    cy.viewport("iphone-x");
    cy.visit("/login");

    cy.get('input[name="email"]').type("rick@ricksroofing.com");
    cy.get('input[name="password"]').type("123");

    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/loggedIn");
  });

  it("Account Type: owner - fails to login when password is incorrect and displays proper error message", () => {
    cy.viewport("iphone-x");
    cy.visit("/login");

    cy.get('input[name="email"]').type("rick@ricksroofing.com");
    cy.get('input[name="password"]').type("12");

    cy.get('button[type="submit"]').click();

    cy.get("#login-error").should("have.text", "Invalid email or password");
  });

  it("Account Type: owner - fails to login when email is incorrect and displays proper error message", () => {
    cy.viewport("iphone-x");
    cy.visit("/login");

    cy.get('input[name="email"]').type("rick@ricksroofing.co");
    cy.get('input[name="password"]').type("123");

    cy.get('button[type="submit"]').click();

    cy.get("#login-error").should("have.text", "Invalid email or password");
  });

  it("Account Type: employee - logs in successfully and redirects", () => {
    cy.viewport("iphone-x");
    cy.visit("/login");

    cy.get('input[name="email"]').type("rachel@hotmail.com");
    cy.get('input[name="password"]').type("123");

    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/loggedIn");
  });

  it("Account Type: employee - fails to login when password is incorrect and displays proper error message", () => {
    cy.viewport("iphone-x");
    cy.visit("/login");

    cy.get('input[name="email"]').type("rachel@hotmail.com");
    cy.get('input[name="password"]').type("12");

    cy.get('button[type="submit"]').click();

    cy.get("#login-error").should("have.text", "Invalid email or password");
  });

  it("Account Type: employee - fails to login when email is incorrect and displays proper error message", () => {
    cy.viewport("iphone-x");
    cy.visit("/login");

    cy.get('input[name="email"]').type("rachel@hotmail.co");
    cy.get('input[name="password"]').type("123");

    cy.get('button[type="submit"]').click();

    cy.get("#login-error").should("have.text", "Invalid email or password");
  });
});
