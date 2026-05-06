import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Modal, InputField, SearchBox, Pagination } from "../../components/UI";
import authBg from "../../assets/images/auth-bg.jpg";
const BG = `url(${authBg})`;
const StudentsPage = () => {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const students = [
    { id: "67894", name: "أحمد محمد", level: "الثاني", dept: "cs", email: "ahmed@uni.edu" },
    { id: "67894", name: "خالد أحمد", level: "الثاني", dept: "IT", email: "khaled@uni.edu" },
    { id: "56783", name: "أنس محمد", level: "الأول", dept: "cs", email: "anas@uni.edu" },
    { id: "23456", name: "باسم أحمد", level: "الرابع", dept: "IT", email: "basem@uni.edu" },
    { id: "09876", name: "نادر خالد", level: "الرابع", dept: "cs", email: "nader@uni.edu" },
  ].filter(s => s.name.includes(search) || s.email.includes(search));

  return (
    <div dir="rtl">
      {showAdd && (
        <Modal title="إضافة طالب جديد" onClose={() => setShowAdd(false)}>
          <InputField label="اسم الطالب" value={newName} onChange={setNewName} placeholder="الاسم الكامل" />
          <InputField label="البريد الإلكتروني" value="" onChange={() => {}} placeholder="email@uni.edu" />
          <InputField label="القسم" value="" onChange={() => {}} placeholder="cs / IT" />
          <div className="flex gap-3 mt-4">
            <Button variant="success" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>حفظ</Button>
            <Button variant="outline" className="flex-1 justify-center" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </div>
        </Modal>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <Button variant="success" size="sm" icon={<Plus />} onClick={() => setShowAdd(true)}>إضافة طالب جديد</Button>
          <h3 className="font-bold text-gray-800">إدارة الطلاب</h3>
        </div>

        <div className="mb-4">
          <SearchBox value={search} onChange={setSearch} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الطالب</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الرقم الجامعي</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">القسم</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">المستوى</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الإيميل</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-gray-800">{s.name}</td>
                  <td className="py-3 px-3 text-gray-500">{s.id}</td>
                  <td className="py-3 px-3"><Badge color="primary">{s.dept}</Badge></td>
                  <td className="py-3 px-3 text-gray-600">{s.level}</td>
                  <td className="py-3 px-3 text-blue-600">{s.email}</td>
                  <td className="py-3 px-3">
                    <Button size="sm" variant="primary">تعديل</Button>
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

export default StudentsPage;
