import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Register from './Pages/Register';
import Protectedroute from './Protectedroute';
import Mydonations from './Pages/Mydonations';
import Ngos from './Pages/Ngos';
const router = createBrowserRouter([
    {path:"/",element:<Login/>},
    {path:"/register",element:<Register/>},
    {path:"/dashboard",element:(<Protectedroute>  <Dashboard/>  </Protectedroute>)},
    {path:"/mydonations",element:(<Protectedroute> <Mydonations/> </Protectedroute>)},
    {path:"/ngos",element:(<Protectedroute> <Ngos/> </Protectedroute>)}
]);
function App() {
  return <RouterProvider router={router}/>
}

export default App
