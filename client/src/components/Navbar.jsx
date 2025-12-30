import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardList, API_URL } from '../Defs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ThemeSelector from './ThemeSelector'
import {
  faHome,
  faSignInAlt,
  faSignOutAlt,
  faChevronDown,
  faTags
} from '@fortawesome/free-solid-svg-icons'

function Navbar() {
  const [token, setToken] = useState('')
  const [uuid, setuuid] = useState(localStorage.getItem('uuid'))
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('nrtoken')
    setToken('')
  }

  const getuuid = async () => {
    if (!uuid) {
      const res = await fetch(`${API_URL}/getuuid`)
      const json = await res.json()
      localStorage.setItem('uuid', json.data)
      setuuid(json.data)
    }
  }

  useEffect(() => {
    getuuid()
    setToken(localStorage.getItem('nrtoken'))
  }, [])

  const handleBoardChange = (e) => {
    const board = e.target.value
    if (board) navigate(`/board/${board}`)
  }

  return (
    <div className="flex items-center gap-2 p-1 text-xs border-b
      bg-[var(--color-headerAlt)]
      border-[var(--color-borderThin)]
      text-[var(--color-text)]"
    >
      {/* Board selector */}
      <div className="flex items-center gap-1">
        <label
          htmlFor="board-select"
          className="flex items-center gap-1 text-[var(--color-secondary)]"
        >
          <FontAwesomeIcon icon={faTags} className="w-3.5 h-3.5" />
          <span>Board:</span>
        </label>

        <div className="relative">
          <select
            id="board-select"
            defaultValue=""
            onChange={handleBoardChange}
            className="
              appearance-none
              pl-2 pr-6 py-0.5
              rounded-md
              border
              cursor-pointer
              focus:outline-none
              bg-[var(--color-background)]
              border-[var(--color-border)]
              text-[var(--color-text)]
            "
          >
            <option value="" disabled>
              Select a board
            </option>
            {boardList.map((board) => (
              <option
                key={board}
                value={board}
                className="
                  bg-[var(--color-background)]
                  text-[var(--color-text)]
                "
              >
                /{board}/
              </option>
            ))}
          </select>

          <FontAwesomeIcon
            icon={faChevronDown}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              w-3 h-3 pointer-events-none
              text-[var(--color-text)]
            "
          />
        </div>
      </div>

      {/* Theme selector */}
      <div className="flex items-center ">
        <ThemeSelector />
      </div>

      {/* Utility links */}
      <div className="flex items-center gap-4 ml-auto">
        <a
          href="/"
          className="flex items-center gap-1 hover:underline text-[var(--color-secondary)]"
        >
          <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
          <span>Home</span>
        </a>

        {(token === '' || token === null) ? (
          <a
            href="/login"
            className="flex items-center gap-1 hover:underline text-[var(--color-secondary)]"
          >
            <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
            <span>Login</span>
          </a>
        ) : (
          <a
            href="#"
            onClick={logout}
            className="flex items-center gap-1 hover:underline text-[var(--color-secondary)]"
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
