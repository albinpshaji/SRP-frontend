import { useState, useEffect } from "react";
import api from "../../services/api";
import { FileText, ImageOff, Loader2 } from "lucide-react";

const NgoProofImage = ({ userid, className }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchProof = async () => {
            try {
                const response = await api.get(`/proof/${userid}/image`, {
                    responseType: 'blob' 
                });
                
                if (isMounted) {
                    setImageUrl(URL.createObjectURL(response.data));
                }
            } catch (error) {
                // Quietly fail
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (userid) fetchProof();

        return () => {
            isMounted = false;
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [userid]);

    if (loading) return (
        <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
            <Loader2 className="animate-spin text-green-700" size={24} />
        </div>
    );

    if (!imageUrl) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-50 text-gray-400 border-2 border-dashed border-gray-200 ${className}`}>
                <ImageOff className="w-8 h-8 mb-2" />
                <span className="text-xs font-medium">No Proof Document</span>
            </div>
        );
    }

    return (
        <div className={`relative group ${className}`}>
            <img src={imageUrl} alt="Proof" className="w-full h-full object-contain bg-black/5" />
            <a 
                href={imageUrl} 
                download={`ngo_proof_${userid}.jpg`}
                className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:text-green-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
            >
                <FileText size={16}/> Download Proof
            </a>
        </div>
    );
};

export default NgoProofImage;