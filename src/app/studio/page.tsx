"use client";

import AdminGate from "@/components/AdminGate";
import CaseManager from "@/components/CaseManager";

// 獨立後台網址 /studio：作品案例管理
export default function StudioPage() {
  return (
    <AdminGate>
      <div className="w-full py-12 bg-[#F3F4F6] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <CaseManager />
        </div>
      </div>
    </AdminGate>
  );
}
