import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Calendar, Phone, BookOpen } from "lucide-react";

import authBg from "../../assets/images/auth-bg.jpg";
const BG = `url(${authBg})`;
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ backgroundImage: BG, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="relative w-[340px] sm:w-[370px] h-[520px] rounded-3xl overflow-hidden shadow-2xl bg-[#d6e4f0]" dir="rtl">

        <div className="absolute top-0 right-0 w-[150px] h-[210px] bg-[#1b4f9e] z-0"
          style={{ clipPath: "polygon(100% 0,100% 78%,52% 100%,18% 72%,42% 0)" }} />
        <div className="absolute top-0 right-0 w-[110px] h-[150px] bg-[#2563b8] z-0 opacity-70"
          style={{ clipPath: "polygon(100% 0,100% 82%,35% 100%,60% 0)" }} />
        <div className="absolute bottom-0 right-0 w-[155px] h-[175px] bg-[#1b4f9e] z-0"
          style={{ clipPath: "polygon(100% 22%,100% 100%,0 100%,22% 55%,55% 0)" }} />
        <div className="absolute bottom-0 right-0 w-[115px] h-[135px] bg-[#2563b8] z-0 opacity-70"
          style={{ clipPath: "polygon(100% 30%,100% 100%,0 100%,30% 60%)" }} />
        <div className="absolute bottom-[-10px] left-[-18px] w-[175px] h-[175px] bg-[#f5c518] rounded-full z-0" />
        <div className="absolute top-[30px] left-[12px] w-[54px] h-[54px] bg-[#f5c518] rounded-full z-0 opacity-50" />
        <div className="absolute top-[18px] left-[72px] w-[10px] h-[10px] bg-[#f5c518] rounded-full z-10" />

        {/* Student */}
        <div className="absolute right-[14px] top-1/2 -translate-y-[54%] w-[115px] h-[115px] rounded-full border-[4px] border-white/90 bg-gradient-to-b from-[#b8cfe8] to-[#7aa4c8] overflow-hidden flex items-end justify-center z-20 shadow-lg">
          <svg width="88" height="88" viewBox="0 0 90 90" fill="none">
            <circle cx="45" cy="25" r="14" fill="#d4a574" />
            <ellipse cx="45" cy="24" rx="12" ry="11" fill="#c8956a" />
            <path d="M18 82 Q28 56 45 53 Q62 56 72 82" fill="#1b4f9e" />
            <path d="M33 53 Q37 67 45 70 Q53 67 57 53" fill="#2563b8" />
            <rect x="35" y="69" width="20" height="7" rx="3" fill="#eceff1" />
          </svg>
        </div>

        {/* Form */}
        <div className="absolute left-0 top-0 bottom-0 w-[66%] z-30 flex flex-col justify-center px-4 py-6">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <div className="w-8 h-8 bg-[#1b4f9e] rounded-lg flex items-center justify-center">
              <BookOpen size={16} color="white" />
            </div>
            <span className="text-[#1b3a6b] text-lg font-extrabold">UniSmart</span>
          </div>

          <h2 className="text-[#1b3a6b] text-[12px] font-bold mb-3 text-right leading-snug">
            إعادة تعيين كلمة المرور
          </h2>

          {sent && (
            <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-[10px] text-center mb-2">
              تم الإرسال! تحقق من بريدك
            </div>
          )}

          <div className="relative mb-3">
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={12} />
            </span>
            <input
              type="email" placeholder="البريد الإلكتروني"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full py-2 px-3 pr-8 text-[11px] border border-gray-200 rounded-lg bg-white/85 text-gray-700 focus:border-[#f5c518] focus:outline-none placeholder:text-[10px] placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={() => email.trim() && setSent(true)}
            className="w-full py-2.5 bg-[#1b4f9e] text-white rounded-xl text-[13px] font-bold shadow-lg hover:bg-[#f5c518] hover:text-[#1b3a6b] transition-all duration-200 active:scale-95"
          >
            إرسال
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-3 text-[10px] text-gray-400 hover:text-[#1b4f9e] transition-colors text-center w-full"
          >
            ← العودة إلى تسجيل الدخول
          </button>
        </div>

        <div className="absolute bottom-3.5 left-3 flex flex-col gap-2 z-40">
          <button className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow text-[#1b4f9e] hover:bg-[#f5c518] transition-colors">
            <Calendar size={12} />
          </button>
          <button className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow text-[#1b4f9e] hover:bg-[#f5c518] transition-colors">
            <Phone size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}