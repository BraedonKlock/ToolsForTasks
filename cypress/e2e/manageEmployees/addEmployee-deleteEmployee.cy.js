describe('Add Employee', () => {
    beforeEach(() => {
        cy.viewport(375, 667);
        cy.session('owner-login', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('select[name=accountType]').select('owner');
        cy.get('input[name=email]').type('rick@ricksroofing.com');
        cy.get('input[name=password]').type('123');
        cy.get('button[type=submit]').click();
        cy.url().should('include', '/loggedin');
    });
  });

    it('adds employee with invalid duplicate id', () => {
        cy.visit('http://localhost:3000/loggedin/manageEmployees');
        cy.get('#addEmployee-image').click();
        cy.get('input[name=employeeid]').type('7');
        cy.get('input[name=name]').type('TEST');
        cy.get('select[name=role]').select('manager');
        cy.get('input[name=email]').type('TEST3');
        cy.get('input[name=password]').type('123');
        cy.get('#addEmployeePage-addBtn').click();
        cy.get('p.error').should('be.visible');
    })

    it('adds employee with invalid duplicate email', () => {
        cy.visit('http://localhost:3000/loggedin/manageEmployees');
        cy.get('#addEmployee-image').click();
        cy.get('input[name=employeeid]').type('100');
        cy.get('input[name=name]').type('TEST');
        cy.get('select[name=role]').select('manager');
        cy.get('input[name=email]').type('rachel@hotmail.com');
        cy.get('input[name=password]').type('123');
        cy.get('#addEmployeePage-addBtn').click();
        cy.get('p.error').should('be.visible');
    })

    it('adds employee with valid input and then deletes', () => {
        cy.visit('http://localhost:3000/loggedin/manageEmployees');
        cy.visit('http://localhost:3000/loggedin/manageEmployees');
        cy.get('#addEmployee-image').click();
        cy.get('input[name=employeeid]').type('100');
        cy.get('input[name=name]').type('TEST');
        cy.get('select[name=role]').select('manager');
        cy.get('input[name=email]').type('TEST@hotmail.com');
        cy.get('input[name=password]').type('123');
        cy.get('#addEmployeePage-addBtn').click();
        cy.get('p.error').should('not.exist');
    })

it('renders the error page when postAddEmployee fails after redirect', () => {
    // Intercept the redirect target and force a 500 HTML page
    cy.intercept('GET', '/loggedin/manageEmployees', {
      statusCode: 500,
      headers: { 'content-type': 'text/html' },
      body: `
        <!doctype html>
        <html>
          <head><title>Server Error</title></head>
          <body>
            <div id="error-page">
              <h1>Server Error</h1>
              <p>Something went wrong while loading manage employees.</p>
            </div>
          </body>
        </html>
      `,
    }).as('manage');

    cy.visit('http://localhost:3000/loggedin/addEmployeePage');

    cy.get('input[name=employeeid]').type('E12345');
    cy.get('input[name=name]').type('Alice');
    cy.get('select[name=role]').select('manager');
    cy.get('input[name=email]').type('alice@example.com');
    cy.get('input[name=password]').type('secret123');

    cy.get('#addEmployeePage-addBtn').click();

    cy.title().should('contain', 'Server Error');
    cy.get('title').should('contain.text', 'Server Error');
    cy.get('h1').should('contain', 'Something went wrong while adding employee');
  });
});