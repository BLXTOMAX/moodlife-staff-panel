import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-[...taille-sidebar...]">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}