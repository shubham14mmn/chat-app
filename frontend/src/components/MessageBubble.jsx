// Single message bubble (text / image / video / pdf) with timestamp + seen tick
import Avatar from "./Avatar.jsx";

export default function MessageBubble({ message, isMine, otherUser, me }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-2 mb-3 ${isMine ? "justify-end" : "justify-start"}`}>
      {!isMine && <Avatar user={otherUser} size={32} />}
      <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-2 rounded-2xl shadow ${
            isMine
              ? "bg-indigo-600 text-white rounded-br-none"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"
          }`}
        >
          {/* File preview */}
          {message.fileUrl && message.fileType === "image" && (
            <img src={message.fileUrl} alt="img" className="rounded-lg max-w-xs mb-1" />
          )}
          {message.fileUrl && message.fileType === "video" && (
            <video src={message.fileUrl} controls className="rounded-lg max-w-xs mb-1" />
          )}
          {message.fileUrl && message.fileType === "pdf" && (
            <a
              href={message.fileUrl} target="_blank" rel="noreferrer"
              className="underline block mb-1"
            >📄 Open PDF</a>
          )}
          {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
        </div>
        <div className={`text-[10px] text-gray-500 mt-1 flex items-center gap-1 ${isMine ? "pr-1" : "pl-1"}`}>
          <span>{time}</span>
          {isMine && <span>{message.seen ? "✓✓" : "✓"}</span>}
        </div>
      </div>
      {isMine && <Avatar user={me} size={32} />}
    </div>
  );
}
