import React from 'react'
import NavBar from './component/NavBar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import AdminDashboard from './pages/AdminDashboard'
import AdminResourcesPage from './pages/AdminResourcesPage'
import UserResourcesPage from './pages/UserResourcesPage'
import { useAuth } from './context/AuthContext'
import BWSidebar from "./layout/BWSidebar";
import BWCreateBooking from "./pages/BWCreateBooking";
import BWMyBookings from "./pages/BWMyBookings";

const App = () => {
  

  return (
    <div>
      <NavBar />
      <BWSidebar />
      <div className='px-6 md:px-16 lg:px-24 xl:px-32'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          
          {/*<Route path="/resources" element={isAdmin ? <AdminResourcesPage /> : <UserResourcesPage />} />*/}
          <Route path="/resources" element={<UserResourcesPage />} />
          <Route path="resourcesadmin" element={<AdminResourcesPage />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/bw" element={<BWDashboard />} />
          <Route path="/bw-create-booking" element={<BWCreateBooking />} />
          <Route path="/bw-my-bookings" element={<BWMyBookings />} />
          
        </Routes>
      </div>
    </div>
  )
}

export default App
