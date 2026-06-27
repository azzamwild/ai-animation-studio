import {
  FolderOpen,
  User,
  Image,
  Box,
  BookOpen,
  Settings,
} from "lucide-react";

const menus = [
  { name: "Projects", icon: FolderOpen },
  { name: "Characters", icon: User },
  { name: "Backgrounds", icon: Image },
  { name: "Props", icon: Box },
  { name: "Stories", icon: BookOpen },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-6">
      <h1 className="text-2xl font-bold text-white">
        AI Animation Studio
      </h1>

      <p className="text-zinc-400 text-sm mt-2">
        Production Dashboard
      </p>

      <nav className="mt-10 space-y-2">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              <Icon size={20} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}