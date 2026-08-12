import React from 'react'
import logo from "../images/logos/logo.png"
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
    <div className="nav flex px-[100px] items-center justify-between h-[90px] bg-[#0f0e0e]">
       <img src={logo} className='w-[170px] object-cover' alt="" />
        <div className="links flex items-center gap-[15px]">
          <Link className=' transition-all hover:text-blue-500'>Home</Link>
          <Link className=' transition-all hover:text-blue-500'>About</Link>
          <Link className=' transition-all hover:text-blue-500'>Services</Link>
          <Link className=' transition-all hover:text-blue-500'>Contact</Link>
          </div>

    </div>
    </>
  )
}

export default Navbar
