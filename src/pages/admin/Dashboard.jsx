import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { RefreshCw, User, MapPin, Hash, AlertCircle, CheckCircle } from "lucide-react";
function Dashboard(){
    const[users,setUsers]=useState([]);
    const[error,setError]=useState('');
    const navigate = useNavigate();

    const fetchUsers =async ()=>{
        try{
            const response = await api.get('/allngos');
            setUsers(response.data);
            setError('');
        }
        catch(error){
            setError("access denied , jwt verification failed");
            if(err.reposnse?.status == 403){
                console.log("403 error");
                navigate('/');
            }
        }
    }

    useEffect(()=>{
        fetchUsers();
    },[]);

    

    return(<div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-2 mt-2 text-green-700 bg-green-100 w-fit px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle size={14} />
                <span>JWT Verification Successful</span>
            </div>
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} />
            Refresh List
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* User Grid (Replaces <ul>) */}
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <div
                key={u.userid}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col gap-4 group"
              >
                {/* Header with Icon */}
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-[#2E7D32] group-hover:text-white transition-colors">
                        <User size={24} />
                    </div>
                    {/* Optional: Add a subtle ID badge */}
                    <span className="text-xs font-mono font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded border border-gray-100">
                        #{u.userid}
                    </span>
                </div>

                {/* User Details */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                        {u.username}
                    </h3>
                    
                    <div className="space-y-2">
                        {/* ID Row */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Hash size={16} className="text-gray-400" />
                            <span>User ID: <span className="text-gray-700 font-medium">{u.userid}</span></span>
                        </div>
                        
                        {/* Location Row */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{u.location || "No location provided"}</span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No users found.</p>
          </div>
        )}

      </div>
    </div>
  );

}

export default Dashboard;