import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Login from './pages/shared/Login';
import Dashboard from './pages/admin/Dashboard';
import Register from './pages/shared/Register';
import Protectedroute from './components/common/Protectedroute';
import Mydonations from './pages/donor/Mydonations';
import Ngos from './pages/donor/Ngos';
import Donateitems from './pages/donor/Donateitems';
import Acceptngos from './pages/admin/Acceptngos';
import Incomingdonations from './pages/distributor/Incomingdonations';
const router = createBrowserRouter([
    {path:"/",element:<Login/>},
    {path:"/register",element:<Register/>},
    {path:"/allngos",element:(<Protectedroute>  <Dashboard/>  </Protectedroute>)},
    {path:"/mydonations",element:(<Protectedroute> <Mydonations/> </Protectedroute>)},
    {path:"/ngos",element:(<Protectedroute> <Ngos/> </Protectedroute>)},
    {path:"/donate/:id",element:(<Protectedroute> <Donateitems/> </Protectedroute>)},
    {path:"/verifyngos",element:(<Protectedroute> <Acceptngos/> </Protectedroute>)},
    {path:"/incomingdonations",element:(<Protectedroute> <Incomingdonations/> </Protectedroute>)}
]);
function App() {
  return <RouterProvider router={router}/>
}

export default App
