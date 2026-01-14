import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";
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

    return(
    <div style={{padding:'2rem'}}><center>
                
                <h1 className="text-green-500">Mydonations</h1>
                <ul>
                    {donations.map(u=>(<li>{u.category} | {u.title} | {u.description} {u.status}</li>))}//a callback fn inside
                </ul>
        </center></div>);
}

export default Mydonations;