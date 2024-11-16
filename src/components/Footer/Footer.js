import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 Mi Proyecto Web OpsMerge. 
          <br/>Todos los derechos reservados.</p>
        <nav>
          <a href="#privacy">Privacidad</a>
          <a href="#terms">Términos de Uso</a>
          <a href="#contact">Contacto</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
