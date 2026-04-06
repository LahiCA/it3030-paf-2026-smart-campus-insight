import React from 'react'
import NavBar from './component/NavBar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ResourceListPage from './pages/ResourceList'


const App = () => {
  return (
    <div>
      <NavBar />
      <div className='px-6 md:px-16 lg:px-24 xl:px-32'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/resources" element={<ResourceListPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
