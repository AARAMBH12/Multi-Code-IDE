import React, { useEffect, useState } from 'react'
import logo from "../images/logos/logo.png"
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api_base_url } from '../helper'

const SignUp = () => {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const submitForm = async (e) => {
    e.preventDefault();
    fetch(api_base_url + "/signUp", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        pwd: pwd
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        navigate("/login");
      }
      else {
        toast.error(data.msg);
      }
    })
  };

  return (
    <div className="con flex flex-col items-center justify-center min-h-screen">

      <form
        onSubmit={submitForm}
        className="w-[25vw] flex flex-col items-center bg-[#0f0e0e] p-[20px] rounded-lg shadow-xl shadow-black/50"
      >

        <img
          className="w-[230px] object-cover"
          src={logo}
          alt="Logo"
        />

        <div className="inputBox">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div className="inputBox">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="inputBox">
          <input
            type="password"
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <p className="text-[gray] text-[14px] mt-3 self-start">
          Already have an account{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-600"
          >
            Login
          </Link>
        </p>

        <button
          type="submit"
          className="btnNormal mt-3 bg-blue-500 transition-all hover:bg-blue-600"
        >
          Sign Up
        </button>

      </form>
    </div>
  )
}

export default SignUp