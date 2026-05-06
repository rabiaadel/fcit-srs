import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Modal, InputField, SearchBox, Pagination } from "../../components/UI";
const RulesPage = () => {
  const [showAdd, setShowAdd] = useState(false);

  const rules = [
    { code: "REG_MAX_CREDITS", semester: "الربيع", status: "فعل", type: "تسجيل" },
    { code: "GPA_MIN_CGPA", semester: "الخريف", status: "مفعل", type: "تسجيل" },
    { code: "ATTEND_MIN", semester: "غير مفعل", status: "على", type: "تسجيل" },
  ];

  return (
    <div dir="rtl">
      {showAdd && (
        <Modal title="اضافة قاعدة" onClose={() => setShowAdd(false)}>
          <div className="mb-3">
            <p className="text-sm text-gray-500 text-right mb-1">كود القاعدة</p>
            <p className="font-mono text-sm text-blue-600 text-right">REG_MAX_CREDITS</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm text-right">
            <div>
              <p className="text-gray-500">النوع</p>
              <p className="font-medium">رقمي</p>
            </div>
            <div>
              <p className="text-gray-500">التصنيف</p>
              <p className="font-medium">تسجيل</p>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-500 text-right mb-1">بيانات القاعدة</p>
            <p className="text-sm text-gray-700 text-right font-mono bg-gray-50 p-2 rounded-lg">1.max_credits: 93 ; 7 have ! :1.3</p>
          </div>
          <InputField label="كود القاعدة" value="" onChange={() => {}} placeholder="RULE_CODE" />
          <div className="flex gap-3 mt-4">
            <Button variant="danger" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>الغاء</Button>
            <Button variant="success" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>حفظ</Button>
          </div>
        </Modal>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Button size="sm" variant="success" icon={<Plus />} onClick={() => setShowAdd(true)}>إضافة قاعدة جديدة</Button>
          <h3 className="font-bold text-gray-800">القواعد الاكاديمية</h3>
        </div>
        <SearchBox value="" onChange={() => {}} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-right py-2 px-3 text-gray-500 font-medium">كود القاعدة</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الفصل الدراسي</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الحالة</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-mono text-blue-600">{r.code}</td>
                  <td className="py-3 px-3 text-gray-600">{r.semester}</td>
                  <td className="py-3 px-3">
                    <Badge color={r.status === "فعل" || r.status === "على" ? "success" : r.status === "مفعل" ? "primary" : "gray"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Badge color="primary">{r.type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>
    </div>
  );
};

export default RulesPage;
