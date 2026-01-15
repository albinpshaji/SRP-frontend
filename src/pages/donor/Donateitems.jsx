import { useState } from "react";
import api from "../../services/api";
import { useParams,useNavigate} from "react-router-dom";
import donateVisual from '../../assets/loginimage.jpg';

function Donateitems(){
    const[title,settitle] = useState('');
    const[description,setdescription]= useState('');
    const[category,setCategory] = useState("Food"); 
    const[logistics,setLogistics] = useState("Dropof"); 
    const[pickupLocation,setPickupLocation] = useState("");

    const navigate = useNavigate();
    const params = useParams();

    const setdonations = async (e)=>{
        e.preventDefault();
        try{
            console.log("before post")
            const did = parseInt(params.id);
            const payload = {
                title,
                description,
                category,
                logistics,
                pickupLocation,
                recepientid: did
            };
            const donation = await api.post('/ngos/donate',payload);
            alert('successfull');
            navigate('/ngos');
        }
        catch(error){
            console.log(error.response?.data);
        }
    }

    return(<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FFF8F0] p-4 sm:p-8">
      
      {/* Main Card */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-auto -mt-10 md:-mt-20">
        
        {/* LEFT: Image Visual */}
        <div className="w-full md:w-1/2 h-48 md:h-auto bg-[#E8F5E9] relative order-1">
          <img 
            src={donateVisual} 
            alt="Donation visual" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute bottom-8 left-8 text-white hidden md:block">
            <h3 className="text-2xl font-bold">Make a Difference</h3>
            <p className="opacity-90">Your contribution changes lives.</p>
          </div>
        </div>

        {/* RIGHT: Donation Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
            Donate Item
          </h2>

          <form onSubmit={setdonations} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Item Title</label>
              <input 
                placeholder="e.g. Winter Jackets (Batch of 10)"
                value={title}
                onChange={(e) => settitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Category & Logistics Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-white"
                >
                  <option value="Food">Food</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Books">Books</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Logistics</label>
                <select
                  value={logistics}
                  onChange={(e) => setLogistics(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none bg-white"
                >
                  <option value="Dropoff">I will Drop-off</option>
                  <option value="Pickup">Pickup Required</option>
                </select>
              </div>
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Pickup Address / Location</label>
              <input 
                placeholder="e.g. 123 Main St, Kochi"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required={logistics=="Pickup"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Description (TextArea) */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
              <textarea 
                placeholder="Describe condition, quantity, expiry date, etc."
                value={description}
                onChange={(e) => setdescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <button 
              type='submit' 
              className="w-full bg-[#2E7D32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 mt-2"
            >
              Confirm Donation
            </button>

          </form>
        </div>

      </div>
    </div>);
}

export default Donateitems;