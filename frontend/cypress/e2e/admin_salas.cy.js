describe('Gestión de Salas (Admin)', () => {
  
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  beforeEach(() => {
    // Login rápido antes de cada test
    cy.visit('/login');
    cy.get('input[name="username"]').type('chris');
    cy.get('input[name="password"]').type('1234');
    cy.get('button[type="submit"]').click();
    cy.contains('Bienvenido', { timeout: 10000 });
  });

  it('Debe permitir crear una nueva sala', () => {
    // 1. Ir a Admin Salas
    cy.contains('Admin Salas').click();
    
    // 2. Verificar URL
    cy.url().should('include', '/salas-admin');

    // 3. Abrir modal (Buscamos por el texto del botón o icono)
    cy.contains('button', 'Nueva Sala').click();

    // 4. Llenar formulario
    const nombreSala = 'Sala Cypress ' + Date.now();
    cy.get('input[name="nombre"]').type(nombreSala);
    cy.get('input[name="capacidad"]').type('50');
    cy.get('input[name="ubicacion"]').type('Piso Test');
    
    // 5. Guardar (Buscamos el botón dentro del formulario modal)
    cy.get('form').contains('button', 'Crear Sala').click();

    // 6. Verificar que aparece en la lista
    cy.contains(nombreSala).should('be.visible');
  });
});