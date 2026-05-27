import { Home, Calendar, Sparkles, User, BarChart3 } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const links = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/book", icon: Calendar, label: "Book" },
  { to: "/style", icon: Sparkles, label: "AI Style" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/admin", icon: BarChart3, label: "Studio" },
];

export const Sidebar = () => (
  <aside className="sticky top-0 hidden h-screen w-20 lg:flex flex-col items-center justify-between py-7">
    <Logo iconOnly />

    <nav className="flex flex-col items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.04] p-2 backdrop-blur-xl">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          title={label}
          className={({ isActive }) =>
            cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
              isActive
                ? "bg-white/[0.1] text-white border border-white/[0.1] shadow-[0_0_16px_-4px_rgba(255,255,255,0.1)]"
                : "text-white/20 hover:bg-white/[0.06] hover:text-white/55"
            )
          }
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </NavLink>
      ))}
    </nav>

    <Link
      to="/profile"
      title="Profile"
      className="h-9 w-9 rounded-full bg-gradient-platinum flex items-center justify-center text-[#080808] font-black text-[10px] shrink-0 transition-opacity hover:opacity-80"
    >
      JC
    </Link>
  </aside>
);
