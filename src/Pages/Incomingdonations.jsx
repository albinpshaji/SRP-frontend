import api from "../api";
import { useEffect, useState } from "react";

function Incomingdonations(){
    const[donations,setdonations] = useState([]);
    const[refresh,setrefresh] = useState(false);

    const incomingdonations =async ()=>{
        try{
            const response = await api.get('/incomingdonations');
            setdonations(response.data);
        }
        catch(error){
            cosole.log("error fetching the data");
        }
    }

    const reject =async (id)=>{
        try{
            await api.put(`/incomingdonations/${id}`,{status:"rejected"});
            setrefresh(prev=>!prev);
            alert("rejected");
        }
        catch(error){
            console.log(error.response?.data);
        }

    }

    const accept = async (id)=>{
            try{
                await api.put(`/incomingdonations/${id}`,{status:"accepted"});
                setrefresh(prev=>!prev);
                alert("accepted");
            }
            catch(error){
                console.log(error.response?.data);
            }
    }

    useEffect(()=>{incomingdonations();},[refresh]);

    return(<div><center>
            <h1>Incoming donations</h1>
            <ul>
                {donations.map(u=>(<li>{u.title}  |  {u.description}  | {u.status} | <button onClick={()=>accept(u.donationid)}>accept</button>  <button onClick={()=>reject(u.donationid)}>reject</button></li>))}
            </ul>
        </center></div>);
}

export default Incomingdonations;