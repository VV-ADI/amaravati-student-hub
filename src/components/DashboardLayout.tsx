import { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/students", icon: Users, label: "Students" },
    { to: "/admin/attendance", icon: ClipboardList, label: "Attendance" },
    { to: "/admin/marks", icon: FileText, label: "Marks & CGPA" },
  ];

  const studentLinks = [
    { to: "/student", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/student/attendance", icon: ClipboardList, label: "Attendance" },
    { to: "/student/marks", icon: FileText, label: "Marks" },
    { to: "/student/profile", icon: UserCircle, label: "Profile" },
  ];

  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-primary text-primary-foreground rounded-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-primary-foreground/20">
            <h1 className="text-xl font-bold font-serif">SRM University AP</h1>
            <p className="text-sm opacity-80 mt-1">Student Management</p>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-primary-foreground/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-semibold">
                {user?.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs opacity-70">{user?.regNumber}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-primary-foreground/10"
                  )}
                  activeClassName="bg-accent text-accent-foreground font-semibold"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-primary-foreground/20">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
