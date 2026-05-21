// Profile page — update name, bio, profile picture
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [pic, setPic] = useState(""); // base64
  const [preview, setPreview] = useState(user?.profilePic || "");
  const [saving, setSaving] = useState(false);

  const handlePic = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5MB)");
    const b64 = await fileToBase64(f);
    setPic(b64); setPreview(b64);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", { name, bio, profilePic: pic });
      updateUser(data);
      toast.success("Profile updated!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</h1>
          <ThemeToggle />
        </div>

        <form onSubmit={save} className="space-y-5">
          <div className="flex flex-col items-center">
            <label className="cursor-pointer">
              <Avatar user={{ ...user, profilePic: preview }} size={120} />
              <input type="file" hidden accept="image/*" onChange={handlePic} />
              <p className="text-center text-sm text-indigo-600 mt-2">Change photo</p>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bio</label>
            <textarea
              value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input
              value={user?.email || ""} disabled
              className="w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-600 text-gray-500"
            />
          </div>

          <button
            disabled={saving}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
