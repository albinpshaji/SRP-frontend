import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Register from './Pages/Register';

const router = createBrowserRouter([
    {path:"/",element:<Login/>},
    {path:"/dashboard",element:<Dashboard/>},
    {path:"/register",element:<Register/>}
]);
function App() {
  return <RouterProvider router={router}/>
}

export default App
