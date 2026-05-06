import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
 import { Badge, Button, Modal, InputField, SearchBox, Pagination } from "../../components/UI";

const CoursesPage = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const courses = [
    { code: "cs101", name: "قواعد البيانات", hours: 3, dept: "cs" },
    { code: "cs102", name: "تراكيب البيانات", hours: 3, dept: "cs" },
    { code: "cs103", name: "الخوارزميات", hours: 3, dept: "IT" },
  ].filter(c => c.name.includes(search) || c.code.includes(search));

  return (
    <div dir="rtl">
      {showAdd && (
        <Modal title="إضافة مقرر جديد" onClose={() => setShowAdd(false)}>
          <InputField label="كود المقرر" value="" onChange={() => {}} placeholder="cs101" />
          <InputField label="اسم المقرر" value="" onChange={() => {}} placeholder="اسم المادة" />
          <InputField label="عدد الساعات" value="" onChange={() => {}} placeholder="3" type="number" />
          <div className="flex gap-3 mt-4">
            <Button variant="success" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>حفظ</Button>
            <Button variant="outline" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </div>
        </Modal>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Button size="sm" variant="success" icon={<Plus />} onClick={() => setShowAdd(true)}>إضافة مقرر</Button>
          <h3 className="font-bold text-gray-800">إدارة المقررات</h3>
        </div>
        <SearchBox value={search} onChange={setSearch} />
        <div className="mt-4 space-y-2">
          {courses.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
              <div className="flex gap-2">
                <Button size="sm" variant="primary" icon={<Edit className="w-3 h-3" />}>تعديل</Button>
                <Button size="sm" variant="danger" icon={<Trash2 className="w-3 h-3" />}>حذف</Button>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-500">{c.code} | {c.hours} ساعات</p>
              </div>
              <Badge color="primary">{c.dept}</Badge>
            </div>
          ))}
        </div>
        <Pagination />
      </div>
    </div>
  );
};

export default CoursesPage;
