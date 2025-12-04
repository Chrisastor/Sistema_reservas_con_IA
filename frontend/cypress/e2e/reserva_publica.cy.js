describe('Flujo de Reserva Pública', () => {
  
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debe permitir solicitar una reserva anónima', () => {
    // Esperamos el botón "Reservar esta sala" (si cambiaste el texto en Inicio.jsx, actualízalo aquí)
    cy.contains('button', 'Reservar esta sala', { timeout: 10000 })
      .first()
      .click({ force: true });

    cy.contains('Solicitar Reserva').should('be.visible');

    cy.get('input[name="nombre"]').type('Cliente Test', { force: true });
    cy.get('input[name="correo"]').type('cliente@test.com', { force: true });
    cy.get('input[name="telefono"]').type('12345678', { force: true });
    
    const hoy = new Date().toISOString().split('T')[0];
    cy.get('input[name="fecha"]').type(hoy, { force: true });
    cy.get('input[name="personas"]').clear({ force: true }).type('2', { force: true });
    cy.get('input[name="hora_inicio"]').type('10:00', { force: true });
    cy.get('input[name="hora_fin"]').type('12:00', { force: true });

    // Verificar disponibilidad
    // Buscamos botón que contenga "Verificar" (más flexible)
    cy.contains('button', 'Verificar').click({ force: true });
    
    // Esperar mensaje de éxito
    cy.contains('Disponible', { timeout: 6000 }).should('exist');
    
    // Confirmar (puede decir "Confirmar Solicitud" o "Confirmar Reserva")
    cy.contains('button', 'Confirmar').click({ force: true });

    // Verificar mensaje final
    cy.contains('Solicitud enviada', { timeout: 10000 }).should('exist');
  });
});