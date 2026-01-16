import { useState,useEffect} from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

function Ngos(){
    const[ngos,setngos] =useState([]);
    const navigate = useNavigate();

    const showngos =async ()=>{
        try{
            const response = await api.get('/ngos');
            setngos(response.data);
        }
        catch(error){   
            console.log('error');
        }
    }

    const handledonate = (id) =>{
        navigate(`/donate/${id}`);
    }

    useEffect(()=>{showngos();}
    ,[]);

    return(<div className="min-h-screen bg-[#FFF8F0] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Browse NGOs</h1>

        {/* Search & Filter Bar (Visual Only - Logic to be added in backend) */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-center">
          {/* Search Input */}
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search NGOs..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none transition-all shadow-sm bg-white"
            />
          </div>

          {/* Filter Buttons (Static for now) */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button className="px-6 py-2 rounded-lg bg-[#2E7D32] text-white font-medium shadow-sm whitespace-nowrap">
              All
            </button>
            <button className="px-6 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap transition-colors">
              Orphanage
            </button>
            <button className="px-6 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap transition-colors">
              Old Age Home
            </button>
          </div>
        </div>

        {/* NGO Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ngos.map((u) => (
            <div
              key={u.userid || u._id} // Prefer unique ID
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image Section */}
              <div className="h-48 bg-gray-200 w-full relative">
                {u.image ? (
                  <img
                    src={u.image}
                    alt={u.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Placeholder if no image
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 font-bold text-lg uppercase">
                      {u.username?.[0] || "NGO"}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-grow">
                
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {u.username}
                </h2>

                {/* Location */}
                <div className="flex items-center text-gray-500 mb-3 text-sm">
                  <MapPin className="w-4 h-4 mr-1" /> {/* Or use <span>📍</span> */}
                  <span>{u.location || "Location not provided"}</span>
                </div>

                {/* Needs (Placeholder or Data) */}
                <div className="mb-6">
                  <span className="text-sm font-bold text-gray-800">Needs: </span>
                  <span className="text-sm text-gray-600">
                    {u.needs || "Financial Support, Supplies"}
                  </span>
                </div>

                {/* Donate Button (Pushed to bottom) */}
                <div className="mt-auto">
                  <button
                    onClick={() => handledonate(u.userid)}
                    className="w-full bg-[#2E7D32] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-transform active:scale-[0.98] shadow-md"
                  >
                    Donate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>);
}

export default Ngos;