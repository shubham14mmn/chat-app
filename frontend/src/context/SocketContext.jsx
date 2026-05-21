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
    if (!user) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    const s = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      query: { userId: user._id },
    });
    setSocket(s);

    s.on("onlineUsers", (users) => setOnlineUsers(users));

    return () => s.disconnect();
    // eslint-disable-next-line
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
