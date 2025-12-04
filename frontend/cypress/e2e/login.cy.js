describe('Flujo de Autenticación', () => {
  
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Debe mostrar error con credenciales incorrectas', () => {
    cy.get('input[name="username"]').should('be.visible').type('usuario_falso');
    cy.get('input[name="password"]').should('be.visible').type('clave_mala');
    
    // Usamos force: true para asegurar el clic
    cy.get('button[type="submit"]').click({ force: true });

    // Verificamos que NO redirija (sigue en /login)
    cy.url().should('include', '/login');
  });

  it('Debe iniciar sesión correctamente como Admin', () => {
    cy.get('input[name="username"]').type('chris');
    cy.get('input[name="password"]').type('1234'); 
    
    cy.get('button[type="submit"]').click({ force: true });

    // Timeout de 20s para la redirección
    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    
    cy.contains('Bienvenido', { timeout: 10000 }).should('exist');
  });
});