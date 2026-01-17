import axios from "axios";

const api_url = 'http://localhost:8080';

const api = axios.create({
    baseURL:api_url,
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem('jwt_token');
    
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}
);

api.interceptors.response.use(
    res=>res,
    err=>{
        if(err.response?.status==401){
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("role");
            window.location.href = "/";
        }
        return Promise.reject(err);
    }
);

export default api;