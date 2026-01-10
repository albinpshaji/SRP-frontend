import { Navigate } from "react-router-dom";
const Protectedroute = ({children}) =>{
    const token = localStorage.getItem('jwt_token');
    console.log(token);
    if(!token){
        return <Navigate to="/" replace/>;
    }
    return children;
};

export default Protectedroute;

