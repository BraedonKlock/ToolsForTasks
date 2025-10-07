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
});