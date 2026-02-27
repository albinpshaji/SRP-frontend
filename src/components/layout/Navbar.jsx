import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProfileImage from '../common/ProfileImage';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setrole] = useState(localStorage.getItem('role'));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  useEffect(() => {
    setrole(localStorage.getItem('role'));
  }, [location]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navlink = "text-gray-600 font-medium hover:text-[#2E7D32] transition-colors duration-300 cursor-pointer text-base tracking-wide";

  const btnStyle = "bg-white text-gray-700 px-5 py-2 rounded-full font-bold text-base border border-gray-200 shadow-sm hover:shadow-md hover:text-red-600 hover:border-red-100 transition-all duration-300 active:scale-95";

  const renderProfileDropdown = () => (
    <div className="relative profile-dropdown-container">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="focus:outline-none flex items-center justify-center p-0 m-0 bg-transparent border-none"
        title="Profile Options"
      >
        <ProfileImage userid={localStorage.getItem('userid')} className="w-10 h-10 rounded-full border-2 border-transparent hover:border-[#2E7D32] object-cover shadow-sm hover:scale-105 transition-all duration-300" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2E7D32] transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            My Profile
          </Link>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => {
              setDropdownOpen(false);
              handleLogout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );

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
            <Link to="/needs" className={navlink}>Needs</Link>
            {renderProfileDropdown()}
          </>
        );

      case 'NGO':
      case 'WARD_MEMBER':
        return (
          <>
            <Link to="/incomingdonations" className={navlink}>Incoming Donations</Link>
            <Link to="/marketplace" className={navlink}>MarketPlace</Link>
            <Link to="/logistics" className={navlink}>Logistics</Link>
            <Link to="/needs" className={navlink}>Needs</Link>
            {renderProfileDropdown()}
          </>
        );

      case 'ADMIN':
        return (
          <>
            <Link to="/verifyngos" className={navlink}>Verify NGOs</Link>
            <Link to="/allngos" className={navlink}>All NGOs</Link>
            <Link to="/conflicts" className={navlink}>Conflicts</Link>
            {renderProfileDropdown()}
          </>
        );

      default:
        return <button onClick={handleLogout} className={btnStyle}>Logout</button>;
    }
  };

  return (
    <nav className='bg-white/90 backdrop-blur-md flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-4 gap-4 md:gap-0 sticky top-0 z-50 shadow-sm border-b border-gray-100'>
      <div className='logo font-extrabold text-[#2E7D32] text-2xl tracking-tight'>Sevana</div>
      <ul className='flex flex-wrap justify-center gap-3 md:gap-8 items-center'>
        {renderLinks()}
      </ul>
    </nav>
  );
};

export default Navbar;