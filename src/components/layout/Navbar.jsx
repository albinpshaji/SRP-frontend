import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProfileImage from '../common/ProfileImage';
import api from '../../services/api';
import { MessageSquare, Send } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setrole] = useState(localStorage.getItem('role'));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Feedback Modal States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState({ type: '', msg: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackStatus({ type: '', msg: '' });

    try {
      await api.post('/feedback', {
        subject: feedbackSubject,
        message: feedbackMessage
      });
      setFeedbackStatus({ type: 'success', msg: 'Feedback submitted successfully!' });
      setFeedbackSubject("");
      setFeedbackMessage("");
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackStatus({ type: '', msg: '' });
      }, 3000);
    } catch (error) {
      setFeedbackStatus({ type: 'error', msg: 'Failed to submit feedback. Please try again.' });
    } finally {
      setSubmittingFeedback(false);
    }
  };

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
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[1010] animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2E7D32] transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            My Profile
          </Link>

          {role && role.toUpperCase() !== 'ADMIN' && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                setShowFeedbackModal(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2E7D32] transition-colors"
            >
              Submit Feedback
            </button>
          )}

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
            <Link to="/leaderboard" className={navlink}>Leaderboard</Link>
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
            <Link to="/feedback" className={navlink}>User Feedback</Link>
            {renderProfileDropdown()}
          </>
        );

      default:
        return <button onClick={handleLogout} className={btnStyle}>Logout</button>;
    }
  };

  return (
    <>
      <nav className='bg-white/90 backdrop-blur-md flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-4 gap-4 md:gap-0 sticky top-0 z-[1000] shadow-sm border-b border-gray-100'>
        <div className='logo font-extrabold text-[#2E7D32] text-2xl tracking-tight'>Sevana</div>
        <ul className='flex flex-wrap justify-center gap-3 md:gap-8 items-center'>
          {renderLinks()}
        </ul>
      </nav>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-[#2E7D32]" />
                Submit Feedback
              </h3>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackStatus({ type: '', msg: '' });
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                ✕
              </button>
            </div>

            {feedbackStatus.msg && (
              <div className={`mb-5 p-3 rounded-lg text-sm font-medium ${feedbackStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {feedbackStatus.msg}
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                  placeholder="E.g., Issue with donation receipt"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea
                  required
                  rows="4"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors resize-none"
                  placeholder="Describe your issue or suggestion..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full flex items-center justify-center px-6 py-3 bg-[#2E7D32] text-white rounded-xl font-bold text-base hover:bg-[#1B5E20] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submittingFeedback ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
