import { useState,useEffect} from "react";
import api from "../api";
function Ngos(){
    const[ngos,setngos] =useState([]);

    const showngos =async ()=>{
        try{
            const response = await api.get('/ngos');
            setngos(response.data);
        }
        catch(error){   
            console.log('error');
        }
    }

    useEffect(()=>{showngos();}
    ,[]);

    return(<div><center>
            <h1>Ngos</h1>
            <ul>
                {ngos.map(u=>(<li>{u.username}  |  {u.userid}</li>))}
            </ul>
        </center></div>);
}

export default Ngos;