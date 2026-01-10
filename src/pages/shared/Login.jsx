import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { username, password });
            localStorage.setItem('jwt_token', response.data.token);
            localStorage.setItem('role',response.data.role);
            alert("login succesfull, jwt saved");
            const role = response.data.role;
            if(role=="DONOR"){
                navigate('/mydonations');
            }
            else if(role=="NGO"){
                navigate('/incomingdonations');
            }
            else if(role=="ADMIN"){
                navigate('/allngos');
            }
            else{
                navigate('/');
            }
            
        }
        catch (error) {
            console.log("login failed!!", error);
            alert("Login failed" + (error.response?.data) || "Unknown error");
        }
    };

    return (<div style={{ padding: '2rem' }}><center>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button type="submit">Login</button>
        </form>
   </center> </div>);
}
export default Login;