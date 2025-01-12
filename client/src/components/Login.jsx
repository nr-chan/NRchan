import React, { useState } from 'react'
import { API_URL } from '../Defs'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async () => {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })

    if (response.status === 200) {
      const json = await response.json()
      localStorage.setItem('nrtoken', json.token)
      setStatus('success')
      nav(-1)
    } else {
      setStatus('failed')
    }
  }

  return (
    <div className='min-h-screen bg-[#FFFFEE] font-sans text-sm flex justify-center items-center'>
      <div className='border border-[#800000] p-6 bg-[#F0E0D6] shadow-lg w-96'>
        <h1 className='text-2xl font-bold text-[#800000] text-center mb-4'>Login</h1>
        <div className='mb-4'>
          <label className='block text-[#800000] mb-2' htmlFor='username'>Username</label>
          <input
            type='text'
            id='username'
            onChange={(e) => setUsername(e.target.value)}
            className='w-full px-3 py-1 border border-[#AAA] bg-white'
            required
          />
        </div>
        <div className='mb-4'>
          <label className='block text-[#800000] mb-2' htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-3 py-1 border border-[#AAA] bg-white'
            required
          />
        </div>
        <div className='flex justify-between items-center mb-2'>
          {(status !== 'failed') ? '' : 'Incorrect Username/Password'}
        </div>
        <div className='flex justify-between items-center'>
          <button
            onClick={handleSubmit}
            className='bg-[#800000] text-white px-4 py-2 hover:bg-[#6A0000]'
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
