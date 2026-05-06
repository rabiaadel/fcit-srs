import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Modal, InputField, SearchBox, Pagination } from "../../components/UI";

const SemestersPage = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const semesters = [
    { year: 2026, season: "الربيع", status: "متاح" },
    { year: 2025, season: "الخريف", status: "مكتمل" },
  ];

  const schedule = [
    { event: "فتح لتسجيل المقررات", desc: "الربيع/2024", date: "4/1/2024" },
    { event: "اخر يوم للاضافة والحذف", desc: "الربيع/2024", date: "4/1/2024" },
    { event: "بداية الامتحانات النهائية", desc: "الربيع/2024", date: "4/1/2024" },
  ];

  return (
    <div dir="rtl">
      {showAdd && (
        <Modal title="إضافة فصل جديد" onClose={() => setShowAdd(false)}>
          <InputField label="السنة الدراسية" value="" onChange={() => {}} placeholder="2026" />
          <InputField label="الفصل الدراسي" value="" onChange={() => {}} placeholder="الربيع / الخريف" />
          <div className="flex gap-3 mt-4">
            <Button variant="success" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>حفظ</Button>
            <Button variant="outline" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </div>
        </Modal>
      )}

      {showSchedule && (
        <Modal title="إضافة موعد جديد" onClose={() => setShowSchedule(false)}>
          <InputField label="الموعد" value="" onChange={() => {}} placeholder="الموعد" />
          <InputField label="الوصف" value="" onChange={() => {}} placeholder="الوصف" />
          <InputField label="التاريخ" value="" onChange={() => {}} placeholder="DD/MM/YYYY" />
          <div className="flex gap-3 mt-4">
            <Button variant="danger" className="flex-1 justify-center" onClick={() => setShowSchedule(false)}>الغاء</Button>
            <Button variant="success" className="flex-1 justify-center" onClick={() => setShowSchedule(false)}>حفظ</Button>
          </div>
        </Modal>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Semester list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Button size="sm" variant="success" icon={<Plus />} onClick={() => setShowAdd(true)}>إضافة فصل جديد</Button>
            <h3 className="font-bold text-gray-800">إدارة الفصول الدراسية</h3>
          </div>
          <SearchBox value="" onChange={() => {}} />
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-4 text-xs text-gray-500 font-medium pb-2 border-b border-gray-100">
              <span className="text-right">القسم</span>
              <span className="text-right">رأس القسم</span>
              <span className="text-right">الإجراء</span>
              <span className="text-right">التقدير</span>
            </div>
            {[
              { name: "علوم الحاسب", head: "د.احمد خالد" },
              { name: "تكنولوجيا المعلومات", head: "د.ايفان ابراهيم" },
              { name: "نظم المعلومات", head: "د.مصطفى يوسف" },
            ].map((d, i) => (
              <div key={i} className="grid grid-cols-4 py-2 border-b border-gray-50 text-sm items-center">
                <span className="text-gray-800">{d.name}</span>
                <span className="text-gray-600">{d.head}</span>
                <Badge color="primary">على</Badge>
                <span className="text-gray-500">A+</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {semesters.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div className="flex gap-2">
                  <Button size="sm" variant="primary">تعديل</Button>
                  <Button size="sm" variant="danger">حذف</Button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{s.year} - {s.season}</p>
                  <Badge color={s.status === "متاح" ? "success" : "gray"}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <Pagination />
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Button size="sm" variant="success" icon={<Plus />} onClick={() => setShowSchedule(true)}>إضافة موعد</Button>
            <h3 className="font-bold text-gray-800">مواعيد الفصول الدراسية</h3>
          </div>
          <SearchBox value="" onChange={() => {}} />
          <div className="mt-4 space-y-3">
            {schedule.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                <Badge color="primary">فعل</Badge>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{item.event}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemestersPage;
