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

 
  const navlink ="text-gray-600 font-medium hover:text-[#2E7D32] transition-colors duration-300 cursor-pointer text-base tracking-wide";
  
  const btnStyle="bg-white text-gray-700 px-5 py-2 rounded-full font-bold text-base border border-gray-200 shadow-sm hover:shadow-md hover:text-red-600 hover:border-red-100 transition-all duration-300 active:scale-95";
  
  const renderLinks = () => {
    if (!role) {
      return (
        <>
          <Link to="/" className={navlink}>Home</Link>
          <Link to="/login" className={navlink}>Login</Link>
          <Link to="/register" className={`bg-[#2E7D32] text-white px-5 py-2 rounded-full font-bold text-base hover:bg-[#1B5E20] transition-all shadow-lg hover:shadow-green-900/20 active:scale-95`}>Sign-up</Link>
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
            <Link to="/incomingdonations" className={navlink}>Incoming Donations</Link>
            <Link to="/marketplace" className={navlink}>MarketPlace</Link>
            <Link to="/logistics" className={navlink}>Logistics</Link>
            <button onClick={handleLogout} className={btnStyle}>Logout</button>
          </>
        );
       
      case 'ADMIN':
        return (
          <>
            <Link to="/verifyngos" className={navlink}>Verify NGOs</Link>
            <Link to="/allngos" className={navlink}>All NGOs</Link>
            <Link to="/conflicts" className={navlink}>Conflicts</Link>
            <button onClick={handleLogout} className={btnStyle}>Logout</button>
          </>
        );
       
      default:
        return <button onClick={handleLogout} className={btnStyle}>Logout</button>;
    }
  };

  return (
    <nav className='bg-white/90 backdrop-blur-md flex justify-between items-center px-8 py-4 sticky top-0 z-50 shadow-sm border-b border-gray-100'>
      <div className='logo font-extrabold text-[#2E7D32] text-2xl tracking-tight'>Sevana</div>
      <ul className='flex gap-8 items-center'>
          {renderLinks()}
      </ul>  
    </nav>
  );
};

export default Navbar;