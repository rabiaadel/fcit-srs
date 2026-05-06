import { useState } from "react";
import { Badge, Button } from "../../components/UI";
const CourseRegistrationPage = () => {
  const [selected, setSelected] = useState(["cs101", "cs102"]);

  const available = [
    { code: "cs101", name: "قواعد البيانات", level: "المستوى الثالث", prereq: "تراكيب البيانات", status: "متاح", hours: 3, canAdd: true },
    { code: "cs102", name: "تراكيب البيانات", level: "المستوى الثاني", prereq: "برمجة1", status: "مغلق", hours: 3, canAdd: false },
  ];

  const toggle = (code) => {
    setSelected(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  return (
    <div dir="rtl">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available courses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">المواد المتاحة</h3>
          <div className="space-y-3">
            {available.map(c => (
              <div key={c.code} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{c.name} | {c.code}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.level}</p>
                    <p className="text-xs text-gray-500">المتطلب السابق: {c.prereq}</p>
                    <p className="text-xs text-gray-500">حالة التسجيل: {c.status}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={c.canAdd ? "success" : "danger"}
                    onClick={() => c.canAdd && toggle(c.code)}
                  >
                    {c.canAdd ? "اضافة" : "مغلق"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected courses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">المواد المختارة</h3>
          <div className="space-y-2 mb-6">
            {selected.map(code => {
              const c = available.find(x => x.code === code);
              if (!c) return null;
              return (
                <div key={code} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm font-medium text-gray-700">{c.name} | {c.code}</span>
                  <span className="text-sm text-gray-500">{c.hours} ساعات</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>إجمالي الساعات: {selected.reduce((a, code) => a + (available.find(x => x.code === code)?.hours || 0), 0)}</span>
            <span>الحد الأقصى للساعات: 18</span>
          </div>
          <Button variant="success" className="w-full justify-center">تأكيد</Button>
        </div>
      </div>

      {/* Graduation eligibility */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
        <h3 className="font-bold text-gray-800 mb-4">اهلية التخرج</h3>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl font-bold text-blue-600">114/132</span>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">تقدم التخرج</div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: "86%" }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "اجمالي الساعات المكتملة", status: "مكتمل" },
            { label: "مواد التخصص المكتملة", status: "مكتمل" },
            { label: "مشروع التخرج", status: "غير مكتمل" },
            { label: "شرط المعدل", status: "مكتمل" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
              <span className="text-sm text-gray-600">{item.label}</span>
              <Badge color={item.status === "مكتمل" ? "success" : "danger"}>{item.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseRegistrationPage;
