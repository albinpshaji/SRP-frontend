import React, { useEffect, useState } from 'react';
import { Link, useNavigate,useLocation} from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const[role,setrole] =useState(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.removeItem('role'); 
    localStorage.removeItem('jwt_token'); 
    navigate('/');
  };

  useEffect(()=>{
      setrole(localStorage.getItem('role'));
  },[location]);

  const navlink ="hover:text-green-500 transition-colors duration-300 cursor-pointer";
  const btnStyle="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full font-medium tracking-wide shadow-sm hover:bg-gray-200 hover:text-gray-900 active:scale-95 transition-all duration-200 border border-gray-200";
  const renderLinks = () => {
    if (!role) {
      return (
        <>
          <Link to="/" className={navlink}>Home</Link>
          <Link to="/login" className={navlink}>login</Link>
          <Link to="/register" className={navlink}>Sign-up</Link>
        </>
      );
    }

    switch (role.toUpperCase()) {
      case 'DONOR':
        return (
          <>
            <Link to="/ngos" className={navlink}>Find NGOs</Link>
            <Link to="/mydonations" className={navlink}>My Donations</Link>
            <button onClick={handleLogout} className={btnStyle}>Logout</button>
          </>
        );
      
      case 'NGO':
      case 'WARD_MEMBER':
        return (
          <>
            <Link to="/incomingdonations" className={navlink}>Incomingdonations</Link>
            <Link to="/logistics" className={navlink}>Logistics</Link>
            <button onClick={handleLogout} className={btnStyle}>Logout</button>
          </>
        );
      
      case 'ADMIN':
        return (
          <>
            <Link to="/verifyngos" className={navlink}>VerifyNgos</Link>
            <Link to="/allngos" className={navlink}>  Allngos</Link>
            <Link to="/conflicts" className={navlink}>Conflicts</Link>
            <button onClick={handleLogout} className={btnStyle}>Logout</button>
          </>
        );
      
      default:
        return <button onClick={handleLogout} className={btnStyle}>Logout</button>;
    }
  };

  return (
    <nav className='bg-white flex justify-between items-center px-6 h-16 sticky top-0 z-50 shadow-sm'>
      <div className='logo font-bold text-green-700 text-2xl'>Sevana</div>
      <ul className='flex gap-4 items-center'>
          {renderLinks()}
      </ul>  
    </nav>
  );
};

export default Navbar;