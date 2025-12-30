// src/components/ThemeSelector.jsx
import { useTheme } from '../context/ThemeContext'
import { themes } from '../themes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faPalette } from '@fortawesome/free-solid-svg-icons'

const ThemeSelector = () => {
  const { availableThemes, setTheme, name: currentTheme } = useTheme()

  return (
    <div className="flex items-center gap-1">
      <label
        htmlFor="theme-select"
        className="flex items-center gap-1 text-[var(--color-secondary)]"
      >
        <FontAwesomeIcon icon={faPalette} className="w-3.5 h-3.5" />
        <span>Theme:</span>
      </label>

      <div className="relative">
        <select
          id="theme-select"
          value={currentTheme}
          onChange={(e) => setTheme(e.target.value)}
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
          {availableThemes.map((themeKey) => (
            <option
              key={themeKey}
              value={themeKey}
              className="
                bg-[var(--color-background)]
                text-[var(--color-text)]
              "
            >
              {themes[themeKey].name}
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
  )
}

export default ThemeSelector
