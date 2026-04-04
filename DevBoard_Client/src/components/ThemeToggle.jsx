import useThemeStore from '../store/themeStore'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sliding circle */}
      <span className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-300 flex items-center justify-center text-xs ${
        isDark
          ? 'translate-x-6 bg-white'
          : 'translate-x-0.5 bg-white'
      }`}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default ThemeToggle