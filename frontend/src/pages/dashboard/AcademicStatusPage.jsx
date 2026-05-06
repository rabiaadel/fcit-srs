import { AlertTriangle } from "lucide-react";

const AcademicStatusPage = () => (
  <div dir="rtl">
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <p className="text-gray-500 text-sm mb-3">معدل الفصل</p>
        <p className="text-4xl font-extrabold text-blue-600">2.3</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <p className="text-gray-500 text-sm mb-3">المعدل التراكمي</p>
        <p className="text-4xl font-extrabold text-blue-600">2.5</p>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        الانذارات الاكاديمية
      </h3>
      <p className="text-blue-600 font-semibold">انذار اكاديمي متتالي: 2</p>
    </div>

    <div className="flex gap-3 mt-6">
      <button className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">السابق</button>
      <button className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">التالي</button>
    </div>
  </div>
);

export default AcademicStatusPage;
