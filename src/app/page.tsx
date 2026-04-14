'use client';

import AppLayout from '@/components/AppLayout';
import RightSidebar from '@/components/RightSidebar';
import DashboardContent from '@/components/DashboardContent';

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardContent />
        <RightSidebar />
      </div>

      {/* Mobile Action Button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-30">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">bolt</span>
        </button>
      </div>
    </AppLayout>
  );
}
