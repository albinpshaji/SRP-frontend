import { useEffect, useState } from "react";
import api from "../api";
function Mydonations(){
    const[donations,setdonations] = useState([]);

    const getmydonations =async ()=>{
        try{
            const response = await api.get('/mydonations');
            setdonations(response.data);
        }
        catch(error){
            console.log("error in loading donations");
        }
    }

    useEffect(()=>{
        getmydonations();
    },[])

    return(<div style={{padding:'2rem'}}><center>
                <h1>Mydonations</h1>
                <ul>
                    {donations.map(u=>(<li>{u.category} | {u.title} | {u.description} {u.status}</li>))}
                </ul>
        </center></div>);
}

export default Mydonations;