import React from 'react'
import "./App.css";
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import NoPage from './pages/NoPage';
import Login from './pages/Login';
import Editor from './pages/Editor';

const App = () => {
  return (
    <>
    <BrowserRouter>
    <RouteHandler />
    </BrowserRouter>
    </>
  )
};
const RouteHandler = () =>{
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/editor/:id" element={<Editor />} />
      <Route path="*" element={<NoPage />} />

    </Routes>
    </>
  )
}

export default App
