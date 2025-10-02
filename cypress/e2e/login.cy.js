describe('Login', () => {
    beforeEach(() => {
    // iPhone 6/7/8 dimensions
    cy.viewport(375, 667);
  });
  
  //FAILED LOGIN ERROR MESSAGE TEST
  it('Shows error message', () => {
    cy.visit('http://localhost:3000/login'); 

    cy.get('select[name=accountType]').select('owner');
    cy.get('input[name=email]').type('rick@ricksroofing.com');
    cy.get('input[name=password]').type('3');  
    cy.get('button[type=submit]').click();

    cy.url().should('include', '/post-login'); 
    cy.get('#login-error').should('be.visible');
  });

  //SUCCESSFUL LOGIN FOR OWNER TEST
  it('logs in with valid credentials for owner', () => {
    cy.visit('http://localhost:3000/login'); 
    // Select required account type
    cy.get('select[name=accountType]').select('owner'); 

    // Fill out form
    cy.get('input[name=email]').type('rick@ricksroofing.com');
    cy.get('input[name=password]').type('123');

    // Submit
    cy.get('button[type=submit]').click();

    // post login route
    cy.url().should('include', '/loggedin'); 
    cy.get('#index-jobsContainer').should('be.visible');
  });

  //SUCESSFUL LOGIN FOR EMPLOYEE TEST
  it('logs in with valid credentials for employee', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('select[name=accountType]').select('employee');
  
    cy.get('input[name=email').type('rachel@hotmail.com');
    cy.get('input[name=password').type('123');
  
    cy.get('button[type=submit]').click();
  
    cy.url().should('include', '/loggedin'); 
    cy.get('#index-jobsContainer').should('be.visible');
  });
});
