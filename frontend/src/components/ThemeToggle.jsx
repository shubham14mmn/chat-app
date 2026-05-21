import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-yellow-300"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <FiSun size={18} />
      ) : (
        <FiMoon size={18} />
      )}
    </button>
  );
}