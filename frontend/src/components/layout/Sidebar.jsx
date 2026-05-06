import { NavLink, useNavigate } from "react-router-dom";
import {
  Users, BookOpen, Building2, CalendarDays, Star,
  ScrollText, ClipboardList, TrendingUp, ClipboardCheck,
  LogOut, ChevronLeft, ChevronRight, BookMarked,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { NAV_LINKS } from "../../constants";

// Map string icon names → Lucide components
const ICON_MAP = {
  Users, BookOpen, Building2, CalendarDays, Star,
  ScrollText, ClipboardList, TrendingUp, ClipboardCheck,
};// Sidebar.jsx - الألوان الجديدة بناءً على الـ Figma design

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const visibleLinks = NAV_LINKS.filter(link =>
    !user?.role || link.roles.includes(user.role)
  );

  return (
    <aside
      dir="rtl"
      className="sidebar-transition flex flex-col h-screen text-gray-700 shadow-lg relative z-20"
      style={{
        width: collapsed ? "72px" : "260px",
        minWidth: collapsed ? "72px" : "260px",
        backgroundColor: "#f8fafc",          // ← خلفية بيضاء/رمادي فاتح جداً
        borderLeft: "1px solid #e2e8f0",     // ← فاصل رمادي خفيف
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: "#3b82f6" }}   // ← أزرق سماوي
        >
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-extrabold text-lg leading-none tracking-wide text-gray-800">
              UniSmart
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">نظام إدارة جامعي</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleLinks.map(link => {
          const Icon = ICON_MAP[link.icon] || BookOpen;
          return (
            <NavLink
              key={link.key}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                 ${isActive
                   ? "text-white font-bold shadow-sm"
                   : "text-gray-500 hover:bg-slate-100 hover:text-gray-800"
                 }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: "#3b82f6" } : {}   // ← أزرق سماوي للـ active
              }
              title={collapsed ? link.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User Info & Logout ── */}
      <div className="border-t border-slate-200 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-slate-100">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#3b82f6" }}
            >
              <span className="text-xs font-bold text-white">
                {user.name?.[0] || "U"}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-gray-800">
                {user.name || "المستخدم"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{user.email || ""}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="تسجيل الخروج"
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-30 text-white"
        style={{ backgroundColor: "#3b82f6" }}
        title={collapsed ? "توسيع القائمة" : "طي القائمة"}
      >
        {collapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  );
}