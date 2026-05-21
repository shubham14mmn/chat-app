// Home page — sidebar + chat window layout
import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import api from "../lib/api";
import { useSocket } from "../context/SocketContext";

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [unread, setUnread] = useState({}); // { userId: count }
  const { socket } = useSocket();

  // Refresh unread counts from server
  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/messages/unread/counts");
      const map = {};
      data.forEach((d) => { map[d._id] = d.count; });
      setUnread(map);
    } catch {}
  }, []);

  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  // When a new message arrives anywhere, refresh counts
  useEffect(() => {
    if (!socket) return;
    const handler = () => refreshUnread();
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, refreshUnread]);

  return (
  <div className="h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-100 dark:from-[#0f172a] dark:via-gray-900 dark:to-black text-black dark:text-white transition-all duration-500">

    {/* On mobile: show only sidebar OR chat window */}
    <div className={`${selected ? "hidden sm:flex" : "flex"} w-full sm:w-auto`}>
      <Sidebar
        selected={selected}
        onSelect={setSelected}
        unread={unread}
        refreshUnread={refreshUnread}
      />
    </div>

    <div className={`${selected ? "flex" : "hidden sm:flex"} flex-1`}>
      {selected ? (
        <ChatWindow
          key={selected._id}
          otherUser={selected}
          onBack={() => setSelected(null)}
          refreshUnread={refreshUnread}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-300">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              💬 Welcome to ChatApp
            </h2>

            <p>
              Select a user from the sidebar to start chatting
            </p>
          </div>
        </div>
      )}
    </div>

  </div>
);
}