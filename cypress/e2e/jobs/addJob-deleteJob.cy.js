describe('Add Job', () => {
    beforeEach(() => {
        cy.viewport(375, 667);
        cy.session('owner-login', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('select[name=accountType]').select('owner');
        cy.get('input[name=email]').type('rick@ricksroofing.com');
        cy.get('input[name=password]').type('123');
        cy.get('button[type=submit]').click();
        cy.url().should('include', '/loggedin'); // ensure session is set
    });
  });

    it('adds job with invalid duplicate jobid', () => {
        cy.visit('http://localhost:3000/loggedin/jobs');

        cy.get('#addJob-image').click();
        cy.get('#addJob-form').should('be.visible')

        cy.get('select[name=jobType]').select('Roofing');

        cy.get("input[name=jobid]").type('45');

        cy.get('input[name=title]').type('TEST');

        cy.get('input[name=date]').type('2025-05-05');

        cy.get('select[name=addEmployee]').select('rachel@hotmail.com');

        cy.get('#addJob-addEmployeeBtn').click();

        cy.get('#addJob-addJobBtn').click();
        cy.get('p.error').should('be.visible');
    })


    it('adds job with valid input and deletes it', () => {
        cy.visit('http://localhost:3000/loggedin/jobs');

        cy.get('#addJob-image').click();
        cy.get('#addJob-form').should('be.visible')

        cy.get('select[name=jobType]').select('Roofing');

        cy.get("input[name=jobid]").type('50');

        cy.get('input[name=title]').type('TEST');

        cy.get('input[name=date]').type('2025-05-05');

        cy.get('select[name=addEmployee]').select('rachel@hotmail.com');

        cy.get('#addJob-addEmployeeBtn').click();

        cy.get('#addJob-addJobBtn').click();
        cy.get('p.error').should('not.exist');

        cy.get('[data-job-id="50"] .three-dot-menu-icon').first().click(); // get three dot meu for job deletion
        cy.get('button[data-job-id="50"').should('be.visible').click(); // click delete job button
    })

it('renders the error page when postAddJob fails after redirect', () => {
    // Intercept the redirect target and force a 500 HTML page
    cy.intercept('POST', '/loggedin/post-addJob', {
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
                          <h1 class="error-message">Something went wrong while adding the job</h1>
                      </main>
              </body>
          </html>
    `,
  }).as('addJob500');
    cy.visit('http://localhost:3000/loggedin/jobs');

    cy.get('#addJob-image').click();

    cy.get('#addJob-form').should('be.visible')
    cy.get('select[name=jobType]').select('Roofing');
    cy.get("input[name=jobid]").type('500');
    cy.get('input[name=title]').type('TEST');
    cy.get('input[name=date]').type('2025-05-05');
    cy.get('#addJob-addJobBtn').click();

    cy.get('title').should('contain', 'Server Error');
    cy.get('h1').should('contain', 'Something went wrong while adding the job');
    });
});