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

    it('edit job test', () => {
        cy.visit('http://localhost:3000/loggedin/jobs');
        // Click the 3-dot menu to reveal options
        cy.get('button.three-dot-menu-icon').first().click();

        // Then click the EDIT link once it appears
        cy.get('#editJobHref').should('be.visible').click();
        cy.get('input[name=jobid]').clear().type('45');
        cy.get('#editJobPage-updateBtn').click();
    });
});