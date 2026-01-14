import {Outlet} from 'react-router-dom';//outlet becomes your component when rendering eg:ngo.jsx etc..
import Navbar from './Navbar'; 

const MainLayout = () => {
  
    return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <main className="flex-grow">
        <Outlet/> 
      </main>
    </div>
  );
};

export default MainLayout;