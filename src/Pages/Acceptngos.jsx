
import { useParams } from "react-router-dom";
import api from "../api";
import { useEffect,useState} from "react";

function Acceptngos(){
    const[ngos,setngos]= useState([]);
    const params = useParams();

    const showallngos = async ()=>{
        try{
            const ngos = await api.get('/allngos');
            setngos(ngos.data);
        }
        catch(error){
            console.log(error.response?.data);
        }
    }

    const acceptngos = async (id)=>{
        try{
            await api.post(`/verify/${id}`,{isverified:true});
            alert("accepted");
        }
        catch(error){
            console.log(error.response?.data);
        }
    }

    const rejectngos = async (id)=>{
        try{
            await api.post(`/verify/${id}`,{isverified:false});
            alert("rejected");
        }
        catch(error){
            console.log(error.response?.data);
        }
    }

    useEffect(()=>{showallngos();},
    []);

    return(<div><center>
            <h1>verify ngos</h1>
            <br/>
            <ul>
                {ngos.map(u=>(
                    <li key={u.userid}>{u.username}   |  {u.userid}  | {u.isverified}  <button onClick={()=>acceptngos(u.userid)}>accept</button>   <button onClick={()=>rejectngos(u.userid)}>reject</button></li>
                ))}
            </ul>
        </center></div>);

}

export default Acceptngos;