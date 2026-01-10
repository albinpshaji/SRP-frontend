import { useState,useEffect} from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
function Ngos(){
    const[ngos,setngos] =useState([]);
    const navigate = useNavigate();

    const showngos =async ()=>{
        try{
            const response = await api.get('/ngos');
            setngos(response.data);
        }
        catch(error){   
            console.log('error');
        }
    }

    const handledonate = (id) =>{
        navigate(`/donate/${id}`);
    }

    useEffect(()=>{showngos();}
    ,[]);

    return(<div><center>
            <Navbar role ="DONOR"/>
            <h1>Ngos</h1>
            <ul>
                {ngos.map(u=>(<li>{u.username}  |  {u.userid} 
                    <button onClick={()=> handledonate(u.userid)}>donate</button></li>))}
            </ul>
        </center></div>);
}

export default Ngos;