describe('Edit Job', () => {
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

    it('edits job with valid input', () => {
        cy.visit('http://localhost:3000/loggedin/jobs');
        // Click the 3-dot menu to reveal options
        cy.get('button.three-dot-menu-icon').first().click();

        // Then click the EDIT link once it appears
        cy.get('#editJobHref').should('be.visible').click();
        cy.get('input[name=jobid]').clear().type('1');
        cy.get('#editJobPage-updateBtn').click();
        cy.get('p.error').should('not.exist');
    });

    it('edits job with invalid input: duplicate id', () => {
        cy.visit('http://localhost:3000/loggedin/jobs');

        cy.get('.job-card[data-job-id="45"]').within(() => {
            cy.get('button.three-dot-menu-icon').click();
            cy.get('a#editJobHref').should('be.visible').click();
        });

        cy.get('input[name=jobid]').clear().type('1');
        cy.get('#editJobPage-updateBtn').click();
        cy.get('p.error').should('be.visible');
    });
});