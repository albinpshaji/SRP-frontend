import { useState } from "react";
import api from "../api";
import { useParams,useNavigate} from "react-router-dom";


function Donateitems(){
    const[title,settitle] = useState('');
    const[description,setdescription]= useState('');

    const navigate = useNavigate();
    const params = useParams();

    const setdonations = async (e)=>{
        e.preventDefault();
        try{
            console.log("before post")
            const did = parseInt(params.id);
            const donation = await api.post('/ngos/donate',{title:title,description:description,recepientid:did});
            alert('successfull');
            navigate('/ngos');
        }
        catch(error){
            console.log(error.response?.data);
        }
    }

    return(<div><center>
            <Navbar role ="DONOR"/>
            <h1>donate</h1>
            <form onSubmit={setdonations}>
                <input placeholder="title"
                        value={title}
                        onChange={(e)=>settitle(e.target.value)}/>
                <br/>
                <input placeholder="description"
                        value={description}
                        onChange={(e)=>setdescription(e.target.value)}/>
                <br/>
                <button type='submit'>donate</button>
            </form>
        </center></div>);
}

export default Donateitems;