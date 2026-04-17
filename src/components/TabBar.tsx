import { Home, Calendar, Sparkles, User, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/book", icon: Calendar, label: "Book" },
  { to: "/style", icon: Sparkles, label: "AI Style" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/admin", icon: BarChart3, label: "Studio" },
];

export const TabBar = () => {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="glass-strong flex items-center gap-1 rounded-full px-2 py-2 shadow-elev">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "press flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {isActive && <span className="tracking-tight">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
