import React from 'react'
import NavBar from './component/NavBar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ResourceListPage from './pages/ResourceList'
import AboutUs from './pages/AboutUs'
import ResourceList from './pages/ResourceList'
import ContactUs from './pages/ContactUs'
import AdminDashboard from './pages/AdminDashboard'
import ResourceDetails from './pages/ResourceDetails'
import ResourcesPage from './pages/ResourcesPage'

const App = () => {
  return (
    <div>
      <NavBar />
      <div className='px-6 md:px-16 lg:px-24 xl:px-32'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/resourcesadmin" element={<ResourceList />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/resources/:id" element={<ResourceDetails />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
