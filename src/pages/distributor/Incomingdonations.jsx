import api from "../../services/api";
import { useEffect, useState } from "react";
import { Check, X, Package } from "lucide-react";

function Incomingdonations(){
    const[donations,setdonations] = useState([]);
    const[refresh,setrefresh] = useState(false);
    const [activeTab, setActiveTab] = useState("All");

    const incomingdonations =async ()=>{
        try{
            const response = await api.get('/incomingdonations');
            setdonations(response.data);
        }
        catch(error){
            cosole.log("error fetching the data");
        }
    }

    const reject =async (id)=>{
        try{
            await api.put(`/incomingdonations/${id}`,{status:"rejected"});
            setrefresh(prev=>!prev);
            alert("rejected");
        }
        catch(error){
            console.log(error.response?.data);
        }

    }

    const accept = async (id)=>{
            try{
                await api.put(`/incomingdonations/${id}`,{status:"accepted"});
                setrefresh(prev=>!prev);
                alert("accepted");
            }
            catch(error){
                console.log(error.response?.data);
            }
    }

    useEffect(()=>{incomingdonations();},[refresh]);

    const filteredDonations =
    activeTab === "All"
      ? donations
      : donations.filter((d) => d.status?.toUpperCase() === activeTab.toUpperCase());


    const getStatusStyles = (status) => {
        const safeStatus = status ? status.toUpperCase() : "PENDING";
        switch (safeStatus) {
            case "PENDING":
                return {
                border: "border-l-orange-500",
                badge: "bg-orange-100 text-orange-700",
                };
            case "ACCEPTED":
                return {
                border: "border-l-green-600",
                badge: "bg-green-100 text-green-700",
                };
            case "REJECTED":
                return {
                border: "border-l-red-500",
                badge: "bg-red-100 text-red-700",
                };
            default:
                return {
                border: "border-l-gray-400",
                badge: "bg-gray-100 text-gray-700",
                };
        }
    };
    

    return(<div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Incoming Requests</h1>

        {/* Filter Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
          {["All", "Pending", "Accepted", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-green-700 border-b-2 border-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {filteredDonations.length > 0 ? (
            filteredDonations.map((u) => {
              const styles = getStatusStyles(u.status);
              const status = u.status?.toUpperCase() || "PENDING";

              return (
                <div
                  key={u.donationid || u._id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 flex flex-col ${styles.border}`}
                >
                  {/* Image Section */}
                  <div className="h-40 bg-gray-50 w-full relative flex items-center justify-center border-b border-gray-100">
                    {u.image ? (
                        <img src={u.image} alt={u.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <Package size={48} strokeWidth={1.5} />
                        </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow">
                    <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 ${styles.badge}`}>
                       {u.status}
                    </span>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                      {u.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow">
                      {u.description || "No description provided."}
                    </p>

                    {/* DYNAMIC ACTION BUTTONS */}
                    <div className="mt-auto">
                        
                        {/* 1. IF PENDING: Show Both */}
                        {status === "PENDING" && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => reject(u.donationid)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors"
                                >
                                    <X size={18} /> Reject
                                </button>
                                <button
                                    onClick={() => accept(u.donationid)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-semibold shadow-md transition-colors active:scale-95"
                                >
                                    <Check size={18} /> Accept
                                </button>
                            </div>
                        )}

                        {/* 2. IF ACCEPTED: Show Reject (Undo) */}
                        {status === "ACCEPTED" && (
                            <button
                                onClick={() => reject(u.donationid)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors"
                            >
                                <X size={18} /> Change to Rejected
                            </button>
                        )}

                        {/* 3. IF REJECTED: Show Accept (Undo) */}
                        {status === "REJECTED" && (
                            <button
                                onClick={() => accept(u.donationid)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] text-white hover:bg-[#1B5E20] font-semibold shadow-md transition-colors active:scale-95"
                            >
                                <Check size={18} /> Restore to Accepted
                            </button>
                        )}

                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <Package size={64} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">No donations found in "{activeTab}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Incomingdonations;