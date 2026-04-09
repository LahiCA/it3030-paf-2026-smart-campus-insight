import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import Footer from '../components/Footer'
import { NavLink } from 'react-router-dom'

const Home = () => {
  return (
    <div className='mt-10'>
      <button>
        <NavLink to="/userresource">User </NavLink>
        
      </button>
      <button>
        <NavLink to="/adminresource">Admin</NavLink>

      </button>
      <MainBanner />
      <Categories />
      <Footer />
      
    </div>
  )
}

export default Home
