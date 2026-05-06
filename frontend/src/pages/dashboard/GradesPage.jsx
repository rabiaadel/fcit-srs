import { Badge } from "../../components/UI";
const GradesPage = () => {
  const grades = [
    { grade: "A+", value: 4.0, label: "ممتاز مرتفع" },
    { grade: "A", value: 4.0, label: "ممتاز" },
    { grade: "B+", value: 3.5, label: "جيد جدا مرتفع" },
    { grade: "B", value: 3.3, label: "جيد جدا" },
    { grade: "B-", value: 2.8, label: "جيد جدا منخفض" },
    { grade: "C", value: 2.3, label: "جيد" },
    { grade: "D", value: 1.8, label: "مقبول" },
    { grade: "F", value: 1.2, label: "راسب" },
  ];

  const colorMap = {
    "A+": "success", A: "success", "B+": "primary", B: "primary",
    "B-": "primary", C: "warning", D: "warning", F: "danger"
  };

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-4">نظام التقديرات</h3>
      <div className="space-y-2">
        {grades.map(g => (
          <div key={g.grade} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-600 text-sm">{g.label}</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">{g.value}</span>
              <Badge color={colorMap[g.grade]}>{g.grade}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradesPage;
