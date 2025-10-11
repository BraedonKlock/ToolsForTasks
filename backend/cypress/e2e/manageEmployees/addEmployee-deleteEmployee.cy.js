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
    cy.intercept('GET', '**/loggedin/manageEmployees', {
        statusCode: 500,
        headers: { 'content-type': 'text/html' },
        body: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Server Error</title>
                <link rel="stylesheet" href="/css/main.css">
            </head>

            <body class="body">
                    <header class="mobile">
                        <nav>
                            <button class="hamburger" id="hamburger">☰</button>
                            <div id="notLoggedIn-logoContainer">
                            <img id="notLoggedIn-logo" src="/photos/lg.png">
                            </div>
                        </nav>

                        <div class="mobile" id="hamburger-nav">
                        <form action="<%= path %>/logout" method="POST">
                            <!--CSRF TOKEN-->
                            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
                            <button type="submit" class="nav-link">
                            Logout
                            <hr class="hamburger-line">
                            </button>
                        </form>
                        <a href= "<%= path %>">Home<hr class="hamburger-line"></a>
                        <a href="<%= path %>/jobs">Jobs<hr class="hamburger-line"></a>
                        <a href="<%= path %>/tools">Tools<hr class="hamburger-line"></a>
                        <a href="<%= path %>/materials">Materials<hr class="hamburger-line"></a>
                        <a href="<%= path %>/manageEmployees">Manage Employees</a>
                        </div>
                    </header>
                        <main id="error-main">
                            <h1 class="error-message">Something went wrong while adding employee</h1>
                        </main>
                </body>
            </html>
        `,
    }).as('manage500');
    cy.visit('http://localhost:3000/loggedin/addEmployeePage');

    cy.get('input[name=employeeid]').type('12345');
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