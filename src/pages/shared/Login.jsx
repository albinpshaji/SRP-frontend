import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import loginVisual from "../../assets/loginimage.jpg";
import { useToast } from "../../context/ToastContext";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const navigateByRole = (role) => {
    if (role === "DONOR") navigate('/mydonations');
    else if (role === "NGO") navigate('/incomingdonations');
    else if (role === "ADMIN") navigate('/allngos');
    else if (role === "NV_NGO") navigate('/verification-pending');
    else if (role === "INCOMPLETE") navigate('/complete-profile');
    else navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      const response = await api.post('/login', { username: trimmedUsername, password: trimmedPassword });
      localStorage.setItem('jwt_token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userid', response.data.userid);
      showToast("Login successful!", "success");
      navigateByRole(response.data.role);
    }
    catch (error) {
      console.log("login failed!!", error);
      showToast("Login failed: " + (error.response?.data?.message || "Unknown error"), "error");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google', { idToken: credentialResponse.credential });
      localStorage.setItem('jwt_token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userid', response.data.userid);
      showToast("Google login successful!", "success");
      navigateByRole(response.data.role);
    } catch (error) {
      console.error("Google login failed", error);
      showToast("Google login failed: " + (error.response?.data || "Unknown error"), "error");
    }
  };

  return (<div className="min-h-[calc(100vh-3px)] flex items-center justify-center bg-[#FFF8F0] p-4 sm:p-8">

    {/* ADDED: -mt-10 (mobile) and md:-mt-20 (desktop) to nudge the card up */}
    <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-auto md:h-[600px] -mt-10 md:-mt-20">

      <div className="w-full md:w-1/2 h-64 md:h-full bg-[#E8F5E9] order-1 md:order-2">
        <img
          src={loginVisual}
          alt="Login visual"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center order-2 md:order-1">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-10 text-center md:text-left">
          Welcome Back!
        </h2>

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all"
              placeholder="username"
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

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google Sign-In Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => showToast("Google login failed", "error")}
            theme="outline"
            size="large"
            width="100%"
            text="signin_with"
          />
        </div>
      </div>

    </div>
  </div>
  );
}
export default Login;