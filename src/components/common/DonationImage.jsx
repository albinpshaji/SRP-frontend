import { useState, useEffect } from "react";
import api from "../../services/api";

const DonationImage = ({ donationId, title, className }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                // Fetches the binary image data 
                const response = await api.get(`/mydonations/${donationId}`, {
                    responseType: 'blob' 
                });
                const url = URL.createObjectURL(response.data);
                setImageUrl(url);
            } catch (error) {
                // Quietly fail if no image exists
            } finally {
                setLoading(false);
            }
        };

        if (donationId) fetchImage();

        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [donationId]);

    if (loading) return <div className={`bg-gray-100 animate-pulse ${className}`} />;
    
    if (!imageUrl) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
                <span className="text-xs">No Image</span>
            </div>
        );
    }

    return <img src={imageUrl} alt={title} className={`object-cover ${className}`} />;
};

export default DonationImage;