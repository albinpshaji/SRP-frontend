import { useState } from "react";
import api from "../../services/api";
import { useParams,useNavigate} from "react-router-dom";
import donateVisual from '../../assets/loginimage.jpg';

function Donateitems(){
    const[title,settitle] = useState('');
    const[description,setdescription]= useState('');
    const[category,setCategory] = useState("Food"); 
    const[logistics,setLogistics] = useState("Dropof"); 
    const[pickuplocation,setPickupLocation] = useState("");
    const[imageFile, setImageFile] = useState(null);

    const navigate = useNavigate();
    const params = useParams();


    //check extension and size
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert("Please upload a valid image (JPG, JPEG, or PNG).");
                e.target.value = null;
                return;
            }
            setImageFile(file);
        }
    };

    const setdonations = async (e) => {
        e.preventDefault();
        
        if (!imageFile) {
            alert("Please upload an image of the item.");
            return;
        }

        try {
            const did = parseInt(params.id);

            const formData = new FormData();

            const donationData = {
                title,
                description,
                category,
                logistics,
                pickuplocation,
                recepientid: did
            };
            
            // wraps the JSON in a Blob so the backend recognizes it as application/json
            formData.append("data", new Blob([JSON.stringify(donationData)], {
                type: 'application/json'
            }));
            
            formData.append("imagefile", imageFile);

            //Axios automatically sets 'multipart/form-data'
            const response = await api.post('/ngos/donate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Donation submitted successfully!');
            navigate('/ngos');
        } catch (error) {
            console.error("Upload failed:", error.response?.data || error.message);
            alert("Failed to submit donation: " + (error.response?.data || "Server Error"));
        }
    }

    return(<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FFF8F0] p-4 sm:p-8">
            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden h-auto -mt-10 md:-mt-20">
                
                <div className="w-full md:w-1/2 h-48 md:h-auto bg-[#E8F5E9] relative order-1">
                    <img src={donateVisual} alt="Donation visual" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Donate Item</h2>

                    <form onSubmit={setdonations} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Item Title</label>
                            <input 
                                value={title} 
                                onChange={(e) => settitle(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none" 
                            />
                        </div>

                        {/* Image Upload Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Item Image (JPG, PNG)</label>
                            <input 
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                required
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>

                        {/* Category & Logistics Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
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
                                <select value={logistics} onChange={(e) => setLogistics(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                                    <option value="Dropoff">I will Drop-off</option>
                                    <option value="Pickup">Pickup Required</option>
                                </select>
                            </div>
                        </div>

                        {/* Pickup Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Pickup Address</label>
                            <input 
                                value={pickuplocation} 
                                onChange={(e) => setPickupLocation(e.target.value)} 
                                required={logistics === "Pickup"}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none" 
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setdescription(e.target.value)} 
                                rows="2" 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none" 
                            />
                        </div>

                        <button type='submit' className="w-full bg-[#2E7D32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B5E20] transition-all shadow-lg active:scale-95 mt-2">
                            Confirm Donation
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Donateitems;