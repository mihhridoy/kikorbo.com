import { Navbar } from '@/components/layout/Navbar';
import { ExpertSidebar } from '@/components/layout/ExpertSidebar';

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <ExpertSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
