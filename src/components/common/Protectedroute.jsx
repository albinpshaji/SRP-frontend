import { Navigate, useLocation } from "react-router-dom";
const Protectedroute = ({ children }) => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Force INCOMPLETE users to complete their profile
    if (role === "INCOMPLETE" && location.pathname !== "/complete-profile") {
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
};

export default Protectedroute;
