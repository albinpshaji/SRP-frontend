import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Register(){
    const[username,setUsername]=useState('');
    const[password,setPassword]=useState('');
    const[role,setRole]=useState('');
    const[phone,setPhone]=useState('');
    const[location,setLocation]=useState('');

    const navigate = useNavigate();
    const handleregister= async (e)=>{
        e.preventDefault();
        try{
            const response = await api.post('/register',{username,password,role,phone,location});
            alert("registerd successfully");
            navigate('/');
        }
        catch(error){   
            console.log("registration failed"+error.response?.data);
            alert("registeration failed"+(error.response?.data)||"unknown error");
        }
    };
    return(<div style={{padding:'2rem'}}><center>
        <h2>Register</h2>
        <form onSubmit={handleregister}>
            <input
                placeholder="Username"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
            />
            <br/>
            <input
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
            />
            <br/>
            <input
                placeholder="role"
                value={role}
                onChange={(e)=>setRole(e.target.value)}
            />
            <br/>
            <input
                placeholder="phone"
                value={phone}
                onChange={(e)=>setPhone(e.target.value)}
            />
            <br/>
            <input
                placeholder="location"
                value={location}
                onChange={(e)=>setLocation(e.target.value)}
            />
            <br/>
            <button type="submit">Register</button>

        </form>
    </center>
    </div>);

}
export default Register;