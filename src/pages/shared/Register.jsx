import { useState } from "react";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Camera, Upload } from "lucide-react"; 

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('DONOR');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    
    
    const [licenceno, setLicenceno] = useState('');
    const [website, setWebsite] = useState('');
    const [imagefile, setImagefile] = useState(null); 

    
    const [profilePic, setProfilePic] = useState(null);

    const navigate = useNavigate();

    const handleregister = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const userDto = {
            username,
            password,
            role,
            phone,
            location,
            licenceno: role === 'NGO' ? licenceno : null,
            website: role === 'NGO' ? website : null
        };

        
        formData.append('user', new Blob([JSON.stringify(userDto)], {
            type: 'application/json'
        }));

        
        if (role === 'NGO' && imagefile) {
            formData.append('proof', imagefile); 
        }

        
        if (profilePic) {
            formData.append('profilepic', profilePic);
        }

        try {
            await api.post('/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Registered successfully!");
            navigate('/login');
        } catch (error) {
            console.error("Registration failed", error);
            const msg = error.response?.data || "Unknown error";
            alert("Registration failed: " + msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">
            
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-[2rem] shadow-xl overflow-hidden min-h-[600px]">
                
                {/* LEFT SIDE: FORM */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                    <p className="text-gray-500 mb-6">Join us in making a difference.</p>

                    {/* Role Toggle */}
                    <div className="bg-gray-100 p-1.5 rounded-full flex mb-6 relative">
                        <button
                            type="button"
                            onClick={() => setRole('DONOR')}
                            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                                role === 'DONOR' ? 'bg-white text-gray-800 shadow-md' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            I am a Donor
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('NGO')}
                            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                                role === 'NGO' ? 'bg-[#2E7D32] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            I am an NGO
                        </button>
                    </div>

                    <form onSubmit={handleregister} className="space-y-4">
                        
                        {/* --- NEW: PROFILE PICTURE UPLOAD --- */}
                        <div className="flex items-center space-x-4 mb-2">
                            <div className="relative group">
                                <label className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#2E7D32] hover:bg-green-50 transition-all overflow-hidden">
                                        {profilePic ? (
                                            <img 
                                                src={URL.createObjectURL(profilePic)} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Camera className="text-gray-400 group-hover:text-[#2E7D32]" size={24} />
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setProfilePic(e.target.files[0])}
                                    />
                                </label>
                            </div>
                            <div className="text-sm text-gray-500">
                                <p className="font-semibold text-gray-700">Profile Photo</p>
                                <p className="text-xs">Optional. Max 5MB.</p>
                            </div>
                        </div>

                        {/* Basic Inputs */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="City"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* NGO SPECIFIC FIELDS */}
                        <div className={`transition-all duration-500 overflow-hidden ${role === 'NGO' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-4 pt-2 border-t border-dashed border-gray-300 mt-2">
                                <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider">NGO Verification Details</p>
                                
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="License Number"
                                    value={licenceno}
                                    onChange={(e) => setLicenceno(e.target.value)}
                                    required={role === 'NGO'}
                                />
                                
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Website (Optional)"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />

                                <div className="relative">
                                    <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#2E7D32] hover:bg-green-50 transition-colors">
                                        <div className="flex items-center space-x-2">
                                            <Upload className="text-gray-400" size={20} />
                                            <span className="text-sm text-gray-500 font-medium">
                                                {imagefile ? imagefile.name : "Upload NGO Proof Document"}
                                            </span>
                                        </div>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => setImagefile(e.target.files[0])}
                                            required={role === 'NGO'}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2E7D32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 mt-6"
                        >
                            {role === 'NGO' ? 'Register as NGO' : 'Register as Donor'}
                        </button>
                        
                        <p className="text-center text-gray-500 text-sm mt-4">
                           Already have an account? <Link to="/login" className="text-[#2E7D32] font-bold hover:underline">Login</Link>
                        </p>

                    </form>
                </div>

                {/* RIGHT SIDE: VISUAL SECTION */}
                <div className="hidden md:flex w-1/2 bg-[#E8F5E9] items-center justify-center relative p-12">
                    <div className="absolute top-10 right-10 w-20 h-20 bg-[#C8E6C9] rounded-full opacity-50 blur-xl"></div>
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#A5D6A7] rounded-full opacity-50 blur-xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-40 h-40 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-2xl mb-6">
                            <Heart size={80} color="white" fill="white" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1B5E20] mb-2">
                            {role === 'NGO' ? 'Partner with Us' : 'Make a Difference'}
                        </h3>
                        <p className="text-[#2E7D32] max-w-xs">
                            {role === 'NGO' 
                             ? 'Join our network to reach more people and amplify your impact.' 
                             : 'Join our community to help those in need and track your contributions.'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Register;