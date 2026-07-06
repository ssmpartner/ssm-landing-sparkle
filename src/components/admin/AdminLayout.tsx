import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAdminAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-ssm-cream">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between gap-4 border-b border-ssm-akzent/40 bg-white px-4">
            <SidebarTrigger className="text-ssm-primaer" />
            <div className="flex items-center gap-3">
              <span
                className="hidden font-verdana text-ssm-grau sm:inline"
                style={{ fontSize: 12 }}
              >
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded border border-ssm-akzent/60 px-3 py-2 font-arial text-ssm-grau transition-colors hover:bg-ssm-cream"
                style={{ fontSize: 13 }}
              >
                <LogOut size={15} /> Abmelden
              </button>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
