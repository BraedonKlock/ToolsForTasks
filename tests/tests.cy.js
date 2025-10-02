describe('Login', () => {
  it('logs in with valid credentials', () => {
    cy.visit('http://localhost:3000/login'); // or '/' if that's your route

    // Select required account type
    cy.get('select[name=accountType]').select('owner'); // value="owner"

    // Fill out form
    cy.get('input[name=email]').type('testuser@example.com');
    cy.get('input[name=password]').type('password123');

    // Submit
    cy.get('button[type=submit]').click();

    // Adjust to your real post-login route
    cy.url().should('include', '/owner'); 
    cy.contains('Jobs').should('be.visible');
  });

  it('shows error for invalid credentials', () => {
    cy.visit('http://localhost:3000/login'); // or '/'

    cy.get('select[name=accountType]').select('owner');
    cy.get('input[name=email]').type('rick@ricksroofing.com');
    cy.get('input[name=password]').type('123');
    cy.get('button[type=submit]').click();

    cy.contains(/invalid email or password/i).should('be.visible');
  });
});
