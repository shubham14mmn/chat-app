
// Socket context — opens a Socket.io connection when the user is logged in
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    const s = io(import.meta.env.VITE_API_URL, {
      query: {
        userId: user._id,
      },
      withCredentials: true,
      transports: ["polling", "websocket"],
    });

    setSocket(s);

    // Connected
    s.on("connect", () => {
      console.log("✅ SOCKET CONNECTED:", s.id);
    });

    // Connection error
    s.on("connect_error", (err) => {
      console.log("❌ SOCKET ERROR:", err.message);
    });

    // Online users
    s.on("onlineUsers", (users) => {
      console.log("ONLINE USERS:", users);
      setOnlineUsers(users);
    });

    return () => {
      s.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

