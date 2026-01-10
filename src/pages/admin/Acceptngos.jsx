
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useEffect,useState} from "react";
import Navbar from "../../components/layout/Navbar";

function Acceptngos(){
    const[ngos,setngos]= useState([]);
    const[refresh,setrefresh] = useState(false);
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
            setrefresh(prev=>!prev);
            alert("accepted");
        }
        catch(error){
            console.log(error.response?.data);
        }
    }

    const rejectngos = async (id)=>{
        try{
            await api.post(`/verify/${id}`,{isverified:false});
            setrefresh(prev=>!prev);
            alert("rejected");
        }
        catch(error){
            console.log(error.response?.data);
        }
    }

    useEffect(()=>{showallngos();},
    [refresh]);

    return(<div><center>
            <Navbar role ="ADMIN"/>
            <h1>verify ngos</h1>
            <br/>
            <ul>
                {ngos.map(u=>(
                    <li key={u.userid}>{u.username}   |  {u.userid}  | {u.isverified?"verified" : "pending"}  
                    <button onClick={()=>acceptngos(u.userid)}>accept</button>   
                    <button onClick={()=>rejectngos(u.userid)}>reject</button></li>
                ))}
            </ul>
        </center></div>);

}
export default Acceptngos;