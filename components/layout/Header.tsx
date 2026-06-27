export default function Header() {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-8">
      <h2 className="text-xl font-semibold text-white">
        Dashboard
      </h2>

      <div className="text-zinc-400">
        AI Animation Studio v0.1
      </div>
    </header>
  );
}