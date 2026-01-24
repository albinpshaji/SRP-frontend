import { useState, useEffect } from "react";
import api from "../../services/api";

const ProfileImage = ({ userid, username, className }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await api.get(`/user/${userid}/image`, {
                    responseType: 'blob' 
                });
            
                const url = URL.createObjectURL(response.data);
                setImageUrl(url);
            } catch (error) {
                
                setImageUrl(null);
            } finally {
                setLoading(false);
            }
        };

        if (userid) fetchImage();

        
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [userid]);

    if (loading) return <div className={`bg-gray-200 animate-pulse ${className}`} />;
 
    if (!imageUrl) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase ${className}`}>
                {username ? username[0] : "U"}
            </div>
        );
    }

    return <img src={imageUrl} alt={username} className={`object-cover ${className}`} />;
};

export default ProfileImage;