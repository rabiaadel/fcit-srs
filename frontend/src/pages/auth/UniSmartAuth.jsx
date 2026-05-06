import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Calendar, Phone, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import authBg from "../../assets/images/auth-bg.jpg";

const BG = `url(${authBg})`;

export default function UniSmartAuth() {
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated]);

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) return;
    login({ name: "مستخدم", email: email, role: role || "admin" });
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: BG,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative w-[340px] sm:w-[370px] h-[520px] rounded-3xl shadow-2xl bg-[#d6e4f0]" dir="rtl">

        <div className="absolute top-0 right-0 w-[150px] h-[210px] bg-[#1b4f9e] z-0 pointer-events-none"
          style={{ clipPath: "polygon(100% 0,100% 78%,52% 100%,18% 72%,42% 0)" }} />
        <div className="absolute top-0 right-0 w-[110px] h-[150px] bg-[#2563b8] z-0 opacity-70 pointer-events-none"
          style={{ clipPath: "polygon(100% 0,100% 82%,35% 100%,60% 0)" }} />
        <div className="absolute bottom-0 right-0 w-[155px] h-[175px] bg-[#1b4f9e] z-0 pointer-events-none"
          style={{ clipPath: "polygon(100% 22%,100% 100%,0 100%,22% 55%,55% 0)" }} />
        <div className="absolute bottom-0 right-0 w-[115px] h-[135px] bg-[#2563b8] z-0 opacity-70 pointer-events-none"
          style={{ clipPath: "polygon(100% 30%,100% 100%,0 100%,30% 60%)" }} />
        <div className="absolute bottom-[-10px] left-[-18px] w-[175px] h-[175px] bg-[#f5c518] rounded-full z-0 pointer-events-none" />
        <div className="absolute top-[30px] left-[12px] w-[54px] h-[54px] bg-[#f5c518] rounded-full z-0 opacity-50 pointer-events-none" />

        <div className="absolute right-[14px] top-1/2 -translate-y-[54%] w-[115px] h-[115px] rounded-full border-[4px] border-white/90 bg-gradient-to-b from-[#b8cfe8] to-[#7aa4c8] overflow-hidden flex items-end justify-center z-0 shadow-lg pointer-events-none">
          <svg width="88" height="88" viewBox="0 0 90 90" fill="none">
            <circle cx="45" cy="25" r="14" fill="#d4a574" />
            <ellipse cx="45" cy="24" rx="12" ry="11" fill="#c8956a" />
            <path d="M18 82 Q28 56 45 53 Q62 56 72 82" fill="#1b4f9e" />
            <path d="M33 53 Q37 67 45 70 Q53 67 57 53" fill="#2563b8" />
            <rect x="35" y="69" width="20" height="7" rx="3" fill="#eceff1" />
          </svg>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-[66%] flex flex-col justify-center px-4 py-6" style={{ zIndex: 10 }}>
          <div className="flex items-center gap-2 mb-3 justify-center">
            <div className="w-8 h-8 bg-[#1b4f9e] rounded-lg flex items-center justify-center">
              <BookOpen size={16} color="white" />
            </div>
            <span className="text-[#1b3a6b] text-lg font-extrabold">UniSmart</span>
          </div>

          <h2 className="text-[#1b3a6b] text-[15px] font-bold mb-3 text-right">تسجيل الدخول</h2>

          <div className="flex flex-col">
            <div className="relative mb-2">
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <User size={12} />
              </span>
              <select
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full py-2 px-3 pr-8 text-[11px] border border-gray-200 rounded-lg bg-white/85 text-gray-700 font-cairo focus:border-[#f5c518] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">إدارة</option>
                <option value="student">طالب</option>
                <option value="teacher">أستاذ</option>
                <option value="admin">مسؤول</option>
              </select>
            </div>

            <div className="relative mb-2">
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <Mail size={12} />
              </span>
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                autoComplete="new-password"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full py-2 px-3 pr-8 text-[11px] border border-gray-200 rounded-lg bg-white/85 text-gray-700 font-cairo focus:border-[#f5c518] focus:outline-none"
              />
            </div>

            <div className="relative mb-1">
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <Lock size={12} />
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="كلمة المرور"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full py-2 px-3 pr-8 pl-8 text-[11px] border border-gray-200 rounded-lg bg-white/85 text-gray-700 font-cairo focus:border-[#f5c518] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b4f9e]"
              >
                {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>

            <button
              type="button"
              onPointerDown={() => navigate("/forgot")}
              className="self-end text-[10px] text-[#1b4f9e] underline mb-3 hover:text-[#f5c518] transition-colors cursor-pointer"
            >
              نسيت كلمة المرور؟
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 bg-[#1b4f9e] text-white rounded-xl text-[13px] font-bold shadow-lg hover:bg-[#f5c518] hover:text-[#1b3a6b] transition-all duration-200 active:scale-95 cursor-pointer"
              style={{ position: "relative", zIndex: 9999 }}
            >
              تسجيل
            </button>
          </div>
        </div>

        <div className="absolute bottom-3.5 left-3 flex flex-col gap-2 z-[60]">
          <button type="button" className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow text-[#1b4f9e] hover:bg-[#f5c518] transition-colors cursor-pointer">
            <Calendar size={12} />
          </button>
          <button type="button" className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow text-[#1b4f9e] hover:bg-[#f5c518] transition-colors cursor-pointer">
            <Phone size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}