import React from 'react'
import MainBanner from '../component/MainBanner'
import Categories from '../component/Categories'
import Footer from '../component/Footer'

const Home = () => {
  return (
    <div className='mt-10'>
      <MainBanner />
      <Categories />
      <Footer />
    </div>
  )
}

export default Home
