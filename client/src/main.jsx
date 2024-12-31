import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider,BrowserRouter } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home.jsx'
import Board from './components/Board.jsx'
import Thread from './components/Thread.jsx'
import Login from './components/Login.jsx'
import P404 from './components/P404.jsx'

const router=createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout/>}>
    <Route path='' element={<Home/>}/>
    <Route path='board/:id' element={<Board/>}/>
    <Route path='thread/:id' element={<Thread/>}/>
    <Route path='login' element={<Login/>}/>
    <Route path='*' element={<P404/>} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
