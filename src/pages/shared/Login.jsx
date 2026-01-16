import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import loginVisual from "../../assets/loginimage.jpg";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', {username, password });
            localStorage.setItem('jwt_token', response.data.token);
            localStorage.setItem('role',response.data.role);
            alert("login succesfull, jwt saved");
            const role = response.data.role;
            if(role=="DONOR"){
                navigate('/mydonations');
            }
            else if(role=="NGO"){
                navigate('/incomingdonations');
            }
            else if(role=="ADMIN"){
                navigate('/allngos');
            }
            else{
                navigate('/');
            }
            
        }
        catch (error) {
            console.log("login failed!!", error);
            alert("Login failed" + (error.response?.data?.message) || "Unknown error");
        }
    };

    return(<div className="min-h-[calc(100vh-3px)] flex items-center justify-center bg-[#FFF8F0] p-4 sm:p-8">
      
      {/* ADDED: -mt-10 (mobile) and md:-mt-20 (desktop) to nudge the card up */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-auto md:h-[600px] -mt-10 md:-mt-20">
        
        <div className="w-full md:w-1/2 h-64 md:h-full bg-[#E8F5E9] order-1 md:order-2">
          <img 
            src={loginVisual} 
            alt="Login visual" 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-10 text-center md:text-left">
            Welcome Back!
          </h2>

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Email Address</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                placeholder="user@demo.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2E7D32] text-white py-3 md:py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 mt-2"
            >
              Login
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
export default Login;