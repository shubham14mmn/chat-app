// Default avatar shown when a user has no profile picture
export default function Avatar({ user, size = 40, online = false }) {
  const letter = (user?.name || "?").charAt(0).toUpperCase();
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {user?.profilePic ? (
        <img
          src={user.profilePic}
          alt={user.name}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div
          className="rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold w-full h-full"
          style={{ fontSize: size / 2.5 }}
        >
          {letter}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
      )}
    </div>
  );
}
