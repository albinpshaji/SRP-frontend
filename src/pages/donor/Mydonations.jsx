import { useEffect, useState } from "react";
import api from "../../services/api";

function Mydonations(){
    const[donations,setdonations] = useState([]);
    const [activeTab, setActiveTab] = useState("All");

    const getmydonations =async ()=>{
        try{
            const response = await api.get('/mydonations');
            setdonations(response.data);
        }
        catch(error){
            console.log("error in loading donations");
        }
    }

    useEffect(()=>{
        getmydonations();
    },[])

    const filteredDonations = activeTab === "All"
            ? donations
            : donations.filter((d) => d.status?.toUpperCase() === activeTab.toUpperCase());

    // Helper for Status Colors (Updated for Rejected)
    const getStatusStyles = (status) => {
        switch (status.toUpperCase()) {
        case "PENDING":
            return {
                border:"border-l-orange-500",
                badge:"bg-orange-100 text-orange-700",
                text:"text-orange-600",
            };
        case "ACCEPTED":
            return {
                border:"border-l-green-600",
                badge:"bg-green-100 text-green-700",
                text:"text-green-600",
            };
        case "REJECTED": 
            return {
                border:"border-l-red-500",
                badge:"bg-red-100 text-red-700",
                text:"text-red-600",
        };
        default:
            return {
                border:"border-l-gray-400",
                badge:"bg-gray-100 text-gray-700",
                text:"text-gray-600",
        };
        }
    };

    return(<div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Donations</h1>

        {/* Filter Tabs (Updated list) */}
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
            filteredDonations.map((donation) => {
              const styles = getStatusStyles(donation.status);

              return (
                <div
                  key={donation.doantionid} 
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 ${styles.border}`}
                >
                  {/* Image Area */}
                  <div className="h-48 bg-gray-200 w-full relative">
                    {donation.image ? (
                        <img src={donation.image} alt={donation.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                             No Image
                        </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-5">
                    {/* Status Badge */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${styles.badge}`}
                    >
                      {donation.status.toUpperCase()}
                    </span>

                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {donation.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {donation.description}
                    </p>

                    <button className="w-full bg-[#2E7D32] text-white py-2.5 rounded-lg font-medium hover:bg-[#1B5E20] transition-colors shadow-sm active:scale-[0.98]">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10">
              No donations found in this category.
            </p>
          )}
        </div>
      </div>
    </div>
    );
}

export default Mydonations;