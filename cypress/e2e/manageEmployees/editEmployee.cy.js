describe('Edit Employee', () => {
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

    it('edits employee with valid input', () => {
        cy.visit('http://localhost:3000/loggedin/manageEmployees');

    });

    it('displays custom error page when employee not found', () => {
        cy.visit('http://localhost:3000/loggedin/edit-employee/999999', { failOnStatusCode: false });

        cy.title().should('contain', 'Not Found');
        cy.get('h1').should('contain.text', 'The page or resource you were looking for was not found');
    });
  });