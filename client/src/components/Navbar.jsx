import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardList, API_URL } from '../Defs'

function Navbar() {
  const [token, setToken] = useState('')
  const navigate = useNavigate()
  const [uuid, setuuid] = useState(localStorage.getItem('uuid'));

  const logout = () => {
    localStorage.removeItem('nrtoken')
    setToken('')
  }
  const getuuid = async () => {
    if (!uuid) {
      const response = await fetch(`${API_URL}/getuuid`);
      const json = await response.json()
      localStorage.setItem('uuid', json.uuid);
      setuuid(json.uuid);
    }
  }

  useEffect(() => {
    getuuid()
    setToken(localStorage.getItem('nrtoken'))
  }, [])

  const handleBoardChange = (event) => {
    const selectedBoard = event.target.value
    if (selectedBoard) {
      navigate(`/board/${selectedBoard}`)
    }
  }

  return (
    <div className='flex gap-2 items-center p-1 text-xs border-b bg-[#fedcba] border-[#d9bfb7]'>
      {/* Dropdown Menu for Boards */}
      <div className='flex gap-1 items-center'>
        <label htmlFor='board-select' className='text-[#800000]'>
          Board:
        </label>
        <select
          id='board-select'
          onChange={handleBoardChange}
          className='p-0.5 rounded-md border focus:outline-none border-[#d9bfb7] bg-[#FCA] text-[#800000]'
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
      <div className='flex gap-2 items-center ml-auto'>
        <a href='/' className='hover:underline text-[#800000]'>
          Home
        </a>
        {(token === '' || token === null)
          ? (
            <a
              href='/login'
              className='hover:underline text-[#800000]'
            >
              Login
            </a>
          )
          : (
            <a
              href='#'
              onClick={logout}
              className='hover:underline text-[#800000]'
            >
              Logou
            </a>
          )}
      </div>
    </div>
  )
}

export default Navbar
