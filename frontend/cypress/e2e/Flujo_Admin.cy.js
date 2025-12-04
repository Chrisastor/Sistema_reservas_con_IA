describe('Flujo de Administración', () => {
  
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="username"]').type('chris');
    cy.get('input[name="password"]').type('1234');
    
    cy.get('button[type="submit"]').click({ force: true });
    
    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    cy.contains('Bienvenido', { timeout: 10000 }).should('exist');
  });

  it('Debe registrar un nuevo cajero', () => {
    // PASO 1: Navegar a /admin/users
    // Intenta encontrar el enlace en el dashboard, si falla, visita directo
    cy.visit('/admin/users');
    
    cy.url().should('include', '/admin/users');

    // Verificar título o formulario
    cy.contains('Registrar Cajeros').should('be.visible');

    // PASO 2: Llenar formulario
    const timestamp = Date.now();
    const username = `cajero_test_${timestamp}`;
    const email = `cajero${timestamp}@test.com`;

    cy.get('input[name="username"]').should('be.visible').type(username, { force: true });
    cy.get('input[name="email"]').type(email, { force: true });
    cy.get('input[name="password"]').type('12345678', { force: true }); // Contraseña válida (>8 chars)

    // PASO 3: Registrar
    // Busca botón que contenga "Registrar Cajero"
    cy.contains('button', 'Registrar Cajero').click({ force: true });

    // PASO 4: Verificación
    // Espera a que aparezca en la tabla o el toast
    cy.contains(username, { timeout: 15000 }).should('be.visible');
  });
});