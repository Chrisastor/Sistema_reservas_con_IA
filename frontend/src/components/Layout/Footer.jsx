import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">🏢 Sistema de Reservas</h3>
            <p className="text-gray-300">
              Sistema profesional de gestión de reservas y salas.
            </p>
            
            <div className="space-y-2 text-sm text-gray-300">
              <p>📧 info@sistemareservas.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 INACAP Curicó - Universidad Tecnológica de Chile</p>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                © {currentYear} Sistema de Reservas. Todos los derechos reservados. Desarollado por Christopher Astorga G
              </p>
            </div>
          </div>

          {/* Google Maps con TU ubicación real */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">📍 Nuestra Ubicación</h4>
            <div className="bg-gray-700 rounded-lg overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3269.1091278422546!2d-71.21375762450518!3d-34.97893117741039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966457c686289e2f%3A0x3f2cd001189bff26!2sInacap%20Curic%C3%B3%20-%20Universidad%20Tecnol%C3%B3gica%20de%20Chile%2C%20Sede%20Curic%C3%B3!5e0!3m2!1ses!2scl!4v1762655048991!5m2!1ses!2scl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="INACAP Curicó - Universidad Tecnológica de Chile"
                className="rounded-lg"
              ></iframe>
            </div>
            
            <p className="text-sm text-gray-400 text-center">
              INACAP Curicó - Universidad Tecnológica de Chile
            </p>
          </div>
        </div>

        {/* Enlaces adicionales */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="/terminos" className="hover:text-white transition-colors">
                Términos y Condiciones
              </a>
              <a href="/privacidad" className="hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="/contacto" className="hover:text-white transition-colors">
                Contacto
              </a>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="Facebook">
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="Twitter">
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="Instagram">
                📷
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="LinkedIn">
                💼
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;