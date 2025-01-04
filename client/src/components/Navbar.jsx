import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardList } from '../Defs'

function Navbar () {
  const [token, setToken] = useState('')
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('nrtoken')
    setToken('')
  }

  useEffect(() => {
    setToken(localStorage.getItem('nrtoken'))
  }, [])

  const handleBoardChange = (event) => {
    const selectedBoard = event.target.value
    if (selectedBoard) {
      navigate(`/board/${selectedBoard}`)
    }
  }

  return (
    <div className='bg-[#fedcba] p-1 text-xs flex items-center gap-2 border-b border-[#d9bfb7]'>
      {/* Dropdown Menu for Boards */}
      <div className='flex items-center gap-1'>
        <label htmlFor='board-select' className='text-[#800000]'>
          Board:
        </label>
        <select
          id='board-select'
          onChange={handleBoardChange}
          className='border border-[#d9bfb7] bg-[#FCA] rounded-md p-0.5 text-[#800000] focus:outline-none'
        >
          <option value='' disabled selected>
            Select a board
          </option>
          {boardList.map((board) => (
            <option className='border border-[#d9bfb7] bg-[#FCA]' key={board} value={board}>
              /{board}/
            </option>
          ))}
        </select>
      </div>

      {/* Utility Links */}
      <div className='ml-auto flex items-center gap-2'>
        <a href='#' className='text-[#800000] hover:underline'>
          Settings
        </a>
        <a href='#' className='text-[#800000] hover:underline'>
          Mobile
        </a>
        <a href='/' className='text-[#800000] hover:underline'>
          Home
        </a>
        {(token === '' || token === null)
          ? (
            <a
              href='/login'
              className='text-[#800000] hover:underline'
            >
              Login
            </a>
            )
          : (
            <a
              href='#'
              onClick={logout}
              className='text-[#800000] hover:underline'
            >
              Logout
            </a>
            )}
      </div>
    </div>
  )
}

export default Navbar
