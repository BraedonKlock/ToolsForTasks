describe('Create Account', () => {
    beforeEach(() => {
    // iPhone 6/7/8 dimensions
    cy.viewport(375, 667);
  });

  it('creates account with invalid input: duplicate email', () => {
    cy.visit('http://localhost:3000/create-account');
    cy.get('select[name=businessType]').select('roofing');
    cy.get('input[name=companyName]').type('test');
    cy.get('input[name=email]').type('rick@ricksroofing.com');
    cy.get('input[name=password]').type('123');
    cy.get('button[type=submit]').click();
    cy.get('p.error').should('be.visible');
  });

  it('Creates account with valid input', () => {
    cy.visit('http://localhost:3000/create-account');
    cy.get('select[name=businessType]').select('roofing');
    cy.get('input[name=companyName]').type('TEST');
    cy.get('input[name=email]').type('TEST@TEST.com');
    cy.get('input[name=password]').type('123');
    cy.get('button[type=submit]').click();
  });
});
