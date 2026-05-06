import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Modal, InputField, SearchBox, Pagination } from "../../components/UI";
const DepartmentsPage = () => {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div dir="rtl">
      {showAdd && (
        <Modal title="اضافة قسم جديد" onClose={() => setShowAdd(false)}>
          <InputField label="القسم" value="" onChange={() => {}} placeholder="اسم القسم" />
          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-600 mb-3">التخصصات المتاحة:</p>
            <div className="flex flex-wrap gap-2">
              {["هندسة البرمجيات", "الذكاء الاصطناعي", "الأمن السيبراني"].map(s => (
                <Badge key={s} color="primary">{s}</Badge>
              ))}
            </div>
            <button className="mt-2 text-sm text-blue-600 hover:underline">اضافة تخصص</button>
          </div>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>الغاء</Button>
            <Button variant="success" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>حفظ</Button>
          </div>
        </Modal>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Button size="sm" variant="success" icon={<Plus />} onClick={() => setShowAdd(true)}>إضافة قسم جديد</Button>
          <h3 className="font-bold text-gray-800">إدارة الأقسام</h3>
        </div>
        <SearchBox value="" onChange={() => {}} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-right py-2 px-3 text-gray-500 font-medium">القسم</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">رأس القسم</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الإجراء</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">التقدير</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "علوم الحاسب", head: "د.احمد خالد" },
                { name: "تكنولوجيا المعلومات", head: "د.ايفان ابراهيم" },
                { name: "نظم المعلومات", head: "د.مصطفى يوسف" },
              ].map((d, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-gray-800">{d.name}</td>
                  <td className="py-3 px-3 text-gray-600">{d.head}</td>
                  <td className="py-3 px-3"><Badge color="primary">على</Badge></td>
                  <td className="py-3 px-3 text-gray-500">A+</td>
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

export default DepartmentsPage;
