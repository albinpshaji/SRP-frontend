import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import VerificationPending from './pages/distributor/VerificationPending';
import Marketplace from './pages/distributor/Marketplace';
import MarketplaceDetails from './pages/distributor/MarketplaceDetails';
import Profile from './pages/shared/Profile';
import NgoProfile from './pages/donor/NgoProfile';
import Logistics from './pages/distributor/Logistics';
import LogisticsDetails from './pages/distributor/LogisticsDetails';
import Needs from './pages/shared/Needs';
import UploadNeed from './pages/shared/UploadNeed';
import Feedback from './pages/admin/Feedback';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/mydonations/:id", element: (<Protectedroute><DonationDetails /></Protectedroute>) },
      { path: "/allngos", element: (<Protectedroute> <Dashboard /> </Protectedroute>) },
      { path: "/mydonations", element: (<Protectedroute><Mydonations /></Protectedroute>) },
      { path: "/ngos", element: (<Protectedroute> <Ngos /> </Protectedroute>) },
      { path: "/donate/:id", element: (<Protectedroute> <Donateitems /> </Protectedroute>) },
      { path: "/marketplace/list", element: (<Protectedroute> <Donateitems /> </Protectedroute>) },
      { path: "/verifyngos", element: (<Protectedroute> <Acceptngos /> </Protectedroute>) },
      { path: "/verifyngos/ngodetails/:id", element: (<Protectedroute> <NgoDetails /> </Protectedroute>) },
      { path: "/incomingdonations", element: (<Protectedroute><Incomingdonations /></Protectedroute>) },
      { path: "/incomingdonations/:id", element: (<Protectedroute><IncomingDonationDetails /></Protectedroute>) },
      { path: "/verification-pending", element: (<Protectedroute><VerificationPending /></Protectedroute>) },
      { path: "/marketplace", element: (<Protectedroute><Marketplace /></Protectedroute>) },
      { path: "/marketplace/:id", element: (<Protectedroute><MarketplaceDetails /></Protectedroute>) },
      { path: "/profile", element: (<Protectedroute><Profile /></Protectedroute>) },
      { path: "/ngos/:id", element: (<Protectedroute><NgoProfile /></Protectedroute>) },
      { path: "/logistics", element: (<Protectedroute><Logistics /></Protectedroute>) },
      { path: "/logistics/:id", element: (<Protectedroute><LogisticsDetails /></Protectedroute>) },
      { path: "/needs", element: (<Protectedroute><Needs /></Protectedroute>) },
      { path: "/upload-need", element: (<Protectedroute><UploadNeed /></Protectedroute>) },
      { path: "/feedback", element: (<Protectedroute><Feedback /></Protectedroute>) }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;