import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}


