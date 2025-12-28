import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardList, API_URL } from '../Defs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faSignInAlt, faSignOutAlt, faChevronDown, faTags } from '@fortawesome/free-solid-svg-icons'

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
      localStorage.setItem('uuid', json.data);
      setuuid(json.data);
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
        <label htmlFor='board-select' className='text-[#800000] flex items-center gap-1'>
          <FontAwesomeIcon icon={faTags} className="w-3.5 h-3.5" />
          <span>Board:</span>
        </label>
        <div className='relative'>
          <select
            id='board-select'
            onChange={handleBoardChange}
            defaultValue=''
            className='appearance-none pl-2 pr-6 py-0.5 rounded-md border focus:outline-none border-[#d9bfb7] bg-[#FCA] text-[#800000] cursor-pointer'
          >
            <option value='' disabled>
              Select a board
            </option>
            {boardList.map((board) => (
              <option className='border border-[#d9bfb7] bg-[#FCA]' key={board} value={board}>
                /{board}/
              </option>
            ))}
          </select>
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className='absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none text-[#800000]' 
          />
        </div>
      </div>

      {/* Utility Links */}
      <div className='flex gap-4 items-center ml-auto'>
        <a href='/' className='hover:underline text-[#800000] flex items-center gap-1'>
          <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
          <span>Home</span>
        </a>
        {(token === '' || token === null)
          ? (
            <a
              href='/login'
              className='hover:underline text-[#800000] flex items-center gap-1'
            >
              <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
              <span>Login</span>
            </a>
          )
          : (
            <a
              href='#'
              onClick={logout}
              className='hover:underline text-[#800000] flex items-center gap-1'
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              <span>Logout</span>
            </a>
          )}
      </div>
    </div>
  )
}

export default Navbar
