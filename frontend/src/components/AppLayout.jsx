import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 h-14 border-b border-line bg-surface-card/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="font-mono text-tx-primary text-[15px] font-semibold tracking-tight flex items-center gap-0.5 no-underline"
        >
          Proto<span className="text-brand">API</span>
          <span className="ml-1 w-1.5 h-1.5 bg-brand rounded-full animate-pulsedot" />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:block font-mono text-[11px] text-tx-ghost">
            {user?.email}
          </span>

          {/* Plan badge */}
          <span
            className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-md border ${
              user?.plan === "pro"
                ? "text-brand border-brand-border bg-brand-muted"
                : "text-tx-secondary border-line bg-surface-elevated"
            }`}
          >
            {user?.plan?.toUpperCase() || "FREE"}
          </span>

          <button
            onClick={handleLogout}
            className="text-xs text-tx-muted px-3 py-1.5 rounded-lg transition-all duration-150 hover:text-coral-accent hover:bg-coral-muted"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
