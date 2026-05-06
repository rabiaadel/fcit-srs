import { Badge, SearchBox, Pagination } from "../../components/UI";

const OperationsPage = () => {
  const ops = [
    { type: "اضافة مقرر", user: "Admin", ip: "192.168.1.12", date: "منذ 30 دقيقة", color: "success" },
    { type: "تحديث طالب", user: "Dr.Ahmed", ip: "192.168.1.10", date: "3/7/2025", color: "primary" },
    { type: "تعديل قاعدة", user: "Admin", ip: "192.168.1.15", date: "3/7/2024", color: "warning" },
  ];

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-4">سجل العمليات</h3>
      <SearchBox value="" onChange={() => {}} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-right py-2 px-3 text-gray-500 font-medium">النوع</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">المستخدم</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">عنوان ip</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {ops.map((op, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-3"><Badge color={op.color}>{op.type}</Badge></td>
                <td className="py-3 px-3 text-gray-700">{op.user}</td>
                <td className="py-3 px-3 font-mono text-gray-500 text-xs">{op.ip}</td>
                <td className="py-3 px-3 text-gray-500">{op.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </div>
  );
};

export default OperationsPage;
