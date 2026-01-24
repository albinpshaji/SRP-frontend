import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/shared/Login';
import Dashboard from './pages/admin/Dashboard';
import Register from './pages/shared/Register';
import Protectedroute from './components/common/Protectedroute';
import Mydonations from './pages/donor/Mydonations';
import Ngos from './pages/donor/Ngos';
import Donateitems from './pages/donor/Donateitems';
import Acceptngos from './pages/admin/Acceptngos';
import Incomingdonations from './pages/distributor/Incomingdonations';
import Home from './pages/shared/Home';
import DonationDetails from './pages/shared/DonationDetails';
import IncomingDonationDetails from './pages/distributor/IncomingDonationDetails';
import NgoDetails from './pages/admin/NgoDetails';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>, // Wraps every component needed in this Layout
    children: [
      {path:"/",element:<Home/>},
      {path:"/login", element: <Login/> },
      {path:"/register",element: <Register/> },
      {path:"/mydonations/:id",element:(<Protectedroute><DonationDetails/></Protectedroute>)},
      {path:"/allngos", element: (<Protectedroute> <Dashboard/> </Protectedroute>) },
      {path:"/mydonations",element: (<Protectedroute><Mydonations/></Protectedroute>) },
      {path:"/ngos", element: (<Protectedroute> <Ngos/> </Protectedroute>) },
      {path:"/donate/:id", element: (<Protectedroute> <Donateitems/> </Protectedroute>) },
      {path:"/verifyngos", element: (<Protectedroute> <Acceptngos/> </Protectedroute>) },
      {path:"/verifyngos/ngodetails/:id", element: (<Protectedroute> <NgoDetails/> </Protectedroute>) },
      {path:"/incomingdonations", element: (<Protectedroute><Incomingdonations/></Protectedroute>) },
      {path:"/incomingdonations/:id",element:(<Protectedroute><IncomingDonationDetails/></Protectedroute>)}
    ]
  }
]);

function App() {
  return <RouterProvider router={router}/>;
}

export default App;