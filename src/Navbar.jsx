import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role'); 
    localStorage.removeItem('jwt_token'); 
    navigate('/');
    window.location.reload(); 
  };

  const renderLinks = () => {
    if (!role) {
      return (
        <>
          <Link to="/browse-ngos">Browse NGOs</Link>
          <Link to="/" className="btn-nav">Login / Join</Link>
        </>
      );
    }

    switch (role.toUpperCase()) {
      case 'DONOR':
        return (
          <>
            <Link to="/ngos">Find NGOs</Link>
            <Link to="/mydonations">My Donations</Link>
            <button onClick={handleLogout} className="btn-nav secondary">Logout</button>
          </>
        );
      
      case 'NGO':
      case 'WARD_MEMBER':
        return (
          <>
            <Link to="/incomingdonations">Incomingdonations</Link>
            <Link to="/logistics">Logistics</Link>
            <button onClick={handleLogout} className="btn-nav secondary">Logout</button>
          </>
        );
      
      case 'ADMIN':
        return (
          <>
            <Link to="/verifyngos">VerifyNgos</Link>
            <Link to="/allngos">  Allngos</Link>
            <Link to="/conflicts">Conflicts</Link>
            <button onClick={handleLogout} className="btn-nav secondary">Logout</button>
          </>
        );
      
      default:
        return <button onClick={handleLogout} className="btn-nav secondary">Logout</button>;
    }
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/')}>
        <i className="fa-solid fa-hands-holding-circle"></i> Sevana
      </div>
      
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <i className="fa-solid fa-bars"></i>
      </div>

      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        {renderLinks()}
      </div>
    </nav>
  );
};

export default Navbar;