import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, ChevronDown, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { NAV_LINKS, ROLE_LABELS } from "../../constants";

function usePageTitle() {
  const { pathname } = useLocation();
  const match = NAV_LINKS.find(l => pathname.startsWith(l.path));
  return match?.label || "لوحة التحكم";
}

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "تم تسجيل 3 طلاب جدد", time: "منذ 5 دقائق", unread: true },
  { id: 2, text: "تحديث جدول الفصل الدراسي", time: "منذ ساعة", unread: true },
  { id: 3, text: "اكتمال نسخة احتياطية للنظام", time: "منذ 3 ساعات", unread: false },
];

export default function TopBar() {
  const { user, logout } = useAuth();
  const pageTitle = usePageTitle();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <header
      dir="rtl"
      className="h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 gap-4 relative z-10"
    >
      <div>
        <h1 className="text-base font-bold text-[#1b3a6b]">{pageTitle}</h1>
        <p className="text-[10px] text-gray-400 leading-none">UniSmart · نظام الإدارة الجامعية</p>
      </div>

      <div className="relative hidden sm:flex items-center max-w-xs w-full">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث سريع..."
          className="w-full pr-9 pl-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4f9e]/30 focus:border-[#1b4f9e] transition-all text-right"
          dir="rtl"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => { setShowNotif(p => !p); setShowProfile(false); }}
            className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1b4f9e] hover:text-[#1b4f9e] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f5c518] rounded-full text-[9px] font-bold text-[#1b3a6b] flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute left-0 top-11 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{unreadCount} غير مقروءة</span>
                <span className="text-sm font-bold text-[#1b3a6b]">الإشعارات</span>
              </div>
              {MOCK_NOTIFICATIONS.map(n => (
                <div
                  key={n.id}
                  className={"px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer" + (n.unread ? " bg-blue-50/40" : "")}
                >
                  <p className="text-sm text-gray-700 text-right">{n.text}</p>
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#1b4f9e] transition-colors"
          >
            <ChevronDown className="w-3 h-3 text-gray-400" />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#1b3a6b]">{user?.name || "المستخدم"}</p>
              <p className="text-[9px] text-gray-400">{ROLE_LABELS[user?.role] || "مستخدم"}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#1b4f9e] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{user?.name?.[0] || "U"}</span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute left-0 top-12 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[#1b3a6b] text-white">
                <p className="text-sm font-bold">{user?.name || "المستخدم"}</p>
                <p className="text-[10px] text-white/60">{user?.email || ""}</p>
              </div>
              <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4" /><span>الملف الشخصي</span>
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" /><span>الإعدادات</span>
              </button>
              <div className="border-t border-gray-100">
                <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /><span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
