import { useState } from "react";
import api from "../../services/api";
import {Link, useNavigate } from "react-router-dom";
import registerVisual from '../../assets/loginimage.jpg'
function Register(){
    const[username,setUsername]=useState('');
    const[password,setPassword]=useState('');
    const[role,setRole]=useState('DONOR');
    const[phone,setPhone]=useState('');
    const[location,setLocation]=useState('');

    const navigate = useNavigate();
    const handleregister= async (e)=>{
        e.preventDefault();
        try{
            const response = await api.post('/register',{username,password,role,phone,location});
            alert("registerd successfully");
            navigate('/login');
        }
        catch(error){   
            console.log("registration failed"+error.response?.data);
            alert("registeration failed"+(error.response?.data)||"unknown error");
        }
    };
    return(<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FFF8F0] p-4 sm:p-8">
      
      {/* Main Card with the "Nudge Up" (-mt-10) to match Login */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-auto -mt-10 md:-mt-20">
        
        {/* IMAGE SECTION (Top on Mobile, Left on Desktop) */}
        <div className="w-full md:w-1/2 h-48 md:h-auto bg-[#E8F5E9] order-1 md:order-2 relative">
          <img 
            src={registerVisual} 
            alt="Register visual" 
            className="w-full h-full object-cover" 
          />
          {/* Optional: Dark overlay so text pops if you want to put text over image */}
          <div className="absolute inset-0 bg-black/10 md:bg-transparent"></div>
        </div>

        {/* FORM SECTION */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
            Create Account
          </h2>

          <form onSubmit={handleregister} className="space-y-4">
            
            {/* Username / Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all placeholder:text-gray-400"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Role & Phone - Side by Side Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-white"
                >
                  <option value="DONOR">Donor</option>
                  <option value="NGO">NGO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                  placeholder="98765..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                placeholder="e.g. Kochi, Kerala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2E7D32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 mt-4"
            >
              Sign Up
            </button>
            
            <p className="text-center text-gray-500 text-sm mt-4">
               Already have an account? <Link to="/login" className="text-[#2E7D32] font-bold hover:underline">Login</Link>
            </p>

          </form>
        </div>

      </div>
    </div>);

}
export default Register;