// Sidebar — search box + list of all users (with unread badges + online dot)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { FiLogOut, FiSearch } from "react-icons/fi";

export default function Sidebar({ selected, onSelect, unread, refreshUnread }) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch users (with optional search)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const url = search ? `/users/search?q=${encodeURIComponent(search)}` : "/users";
        const { data } = await api.get(url);
        setUsers(data);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  console.log("ONLINE USERS:", onlineUsers);

  return (
    <aside className="w-full sm:w-80 border-r dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
      {/* Header with my profile */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-3 hover:opacity-80">
          <Avatar user={user} size={42} />
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">View profile</p>
          </div>
        </Link>
        <div className="flex gap-2">
          <ThemeToggle />
          <button onClick={logout} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Logout">
            <FiLogOut size={18} />
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="p-3 border-b dark:border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center p-4 text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center p-4 text-gray-500">No users found</p>
        ) : (
          users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            const unreadCount = unread[u._id] || 0;
            const isActive = selected?._id === u._id;
            return (
              <button
                key={u._id}
                onClick={() => { onSelect(u); refreshUnread(); }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                  isActive ? "bg-indigo-50 dark:bg-gray-700" : ""
                }`}
              >
                <Avatar user={u} size={44} online={isOnline} />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800 dark:text-white">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
