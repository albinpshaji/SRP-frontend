import { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

function Dashboard(){
    const[users,setUsers]=useState([]);
    const[error,setError]=useState('');
    const navigate = useNavigate();

    const fetchUsers =async ()=>{
        try{
            const response = await api.get('/allngos');
            setUsers(response.data);
            setError('');
        }
        catch(error){
            setError("access denied , jwt verification failed");
            if(err.reposnse?.status == 403){
                console.log("403 error");
                navigate('/login');
            }
        }
    }

    useEffect(()=>{
        fetchUsers();
    },[]);

    const logout = ()=>{
        localStorage.removeItem('jwt_token');
        navigate('/');
    }

    return(<div style={{padding:'2rem'}}>
                <h2>DashBoard</h2>
                <p>jwt was succesfull</p>
                <button onClick={fetchUsers}>Refresh List</button>
                <button onClick={logout}>Logout</button>

                {
                    error && <h3 style={{color:'red'}}>{error}</h3>
                }

                <ul>
                    {users.map(u=>(
                        <li key={u.userid}>
                            <b>ID:</b>{u.userid} | <b>Users:</b>{u.username}
                        </li>
                    ))}
                </ul>

    </div>);

}

export default Dashboard;