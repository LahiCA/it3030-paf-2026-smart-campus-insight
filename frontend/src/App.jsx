import React from 'react'
import NavBar from './component/NavBar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import AdminDashboard from './pages/AdminDashboard'
import AdminResourcesPage from './pages/AdminResourcesPage'
import UserResourcesPage from './pages/UserResourcesPage'
import { useAuth } from './context/AuthContext'

const App = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'

  return (
    <div>
      <NavBar />
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
        </Routes>
      </div>
    </div>
  )
}

export default App
