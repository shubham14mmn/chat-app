// Chat window — message list + input box (text, file, emoji, typing indicator)
import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar.jsx";
import MessageBubble from "./MessageBubble.jsx";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { FiSend, FiPaperclip, FiSmile, FiArrowLeft, FiPhone } from "react-icons/fi";

// Convert a File to a base64 data URL (so we can send it via JSON)
const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

export default function ChatWindow({ otherUser, onBack, refreshUnread }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const isOnline = onlineUsers.includes(otherUser._id);

  // Load messages + mark as seen
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get(`/messages/${otherUser._id}`);
        if (!cancel) setMessages(data);
        await api.put(`/messages/seen/${otherUser._id}`);
        refreshUnread();
      } catch {
        toast.error("Failed to load messages");
      }
    })();
    return () => { cancel = true; };
  }, [otherUser._id]);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  // Listen for incoming socket events
  useEffect(() => {
    if (!socket) return;
    const onNew = (msg) => {
      // Only add if it belongs to this conversation
      if (msg.senderId === otherUser._id || msg.receiverId === otherUser._id) {
        setMessages((m) => [...m, msg]);
        // Mark as seen since chat is open
        if (msg.senderId === otherUser._id) {
          api.put(`/messages/seen/${otherUser._id}`).then(refreshUnread);
        }
      } else {
        refreshUnread();
      }
    };
    const onTyping = ({ from }) => { if (from === otherUser._id) setOtherTyping(true); };
    const onStop = ({ from }) => { if (from === otherUser._id) setOtherTyping(false); };
    const onSeen = ({ by }) => {
      if (by === otherUser._id) {
        setMessages((m) => m.map((x) => ({ ...x, seen: true })));
      }
    };
        //ADD HERE
      const onIncomingCall = (data) => {
  setIncomingCall(data);

  toast.success(`${data.from.name} is calling you`);
};

//FROM HERE

    socket.on("newMessage", onNew);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStop);
    socket.on("messagesSeen", onSeen);
    socket.on("incomingCall", onIncomingCall);    //ADD HERE
    return () => {
      socket.off("newMessage", onNew);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStop);
      socket.off("messagesSeen", onSeen);
      socket.off("incomingCall", onIncomingCall); //ADD HERE
    };
  }, [socket, otherUser._id]);

  // Notify the other user that I'm typing
  const handleType = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing", { to: otherUser._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stopTyping", { to: otherUser._id });
    }, 1500);
  };

  const sendText = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/send/${otherUser._id}`, { text });
      setMessages((m) => [...m, data]);
      setText("");
      socket?.emit("stopTyping", { to: otherUser._id });
    } catch {
      toast.error("Failed to send");
    } finally { setSending(false); }
  };

  const sendFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return toast.error("File too large (max 20MB)");

    let fileType = "";
    if (file.type.startsWith("image/")) fileType = "image";
    else if (file.type.startsWith("video/")) fileType = "video";
    else if (file.type === "application/pdf") fileType = "pdf";
    else return toast.error("Only images, videos, or PDFs are allowed");

    setSending(true);
    const t = toast.loading("Uploading...");
    try {
      const base64 = await fileToBase64(file);
      const { data } = await api.post(`/messages/send/${otherUser._id}`, {
        file: base64, fileType,
      });
      setMessages((m) => [...m, data]);
      toast.success("Sent!", { id: t });
    } catch {
      toast.error("Upload failed", { id: t });
    } finally {
      setSending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
//ADD THIS LINE 
  const startVoiceCall = () => {
  setCalling(true);

  socket.emit("callUser", {
    to: otherUser._id,
    from: user,
  });

  toast.success(`Calling ${otherUser.name}...`);
};

//FROM HERE
  return (
    <>
    {incomingCall && (
      <div className="fixed top-5 right-5bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl z-50">

        <p className="font-semibold mb-4 dark:text-white">
          {incomingCall.from.name} is calling...
        </p>

        <div className="flex gap-3">

          <button
            onClick={() => {
              setCalling(true);
              setIncomingCall(null);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Accept
          </button>

          <button
            onClick={() => setIncomingCall(null)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Reject
          </button>

        </div>
      </div>
    )}

   <div className="flex-1 flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black h-full">
     {/* Header */}
<div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">

  <button
    onClick={onBack}
    className="sm:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    <FiArrowLeft />
  </button>

  <Avatar
    user={otherUser}
    size={42}
    online={isOnline}
  />

  {/* User Info */}
  <div className="flex-1">

    <p className="font-semibold text-gray-800 dark:text-white">
      {otherUser.name}
    </p>

    <p className="text-xs text-gray-500">
      {otherTyping
        ? "typing..."
        : isOnline
        ? "Online"
        : "Offline"}
    </p>

  </div>

  {/* Voice Call Button */}
  <button
    onClick={() => startVoiceCall()}
    className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition"
    title="Voice Call"
  >
    <FiPhone size={18} />
  </button>

</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No messages yet. Say hi 👋</p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isMine={m.senderId === user._id || m.senderId?._id === user._id}
            otherUser={otherUser}
            me={user}
          />
        ))}
        {otherTyping && <p className="text-sm text-gray-500 italic">{otherUser.name} is typing...</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {showEmoji && (
        <div className="absolute bottom-20 right-4 z-10">
          <EmojiPicker onEmojiClick={(emoji) => setText((t) => t + emoji.emoji)} />
        </div>
      )}
      <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title="Attach file"
        >
          <FiPaperclip />
        </button>
        <input
          type="file" ref={fileRef} hidden onChange={sendFile}
          accept="image/*,video/*,application/pdf"
        />
        <button
          onClick={() => setShowEmoji((s) => !s)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <FiSmile />
        </button>
        <input
          value={text}
          onChange={handleType}
          onKeyDown={(e) => e.key === "Enter" && sendText()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={sendText} disabled={sending || !text.trim()}
          className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
        >
          <FiSend />
        </button>
      </div>
    </div>
    </>
  );
}
