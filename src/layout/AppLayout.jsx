import { Outlet } from "react-router";
import { useSidebar } from "../hooks/useSidebar";
import { SidebarProvider } from "../provider/SidebarProvider";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex overflow-x-hidden">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""} overflow-x-hidden lg:h-screen lg:overflow-y-auto`}
      >
        <AppHeader />
        <div className="mx-auto max-w-screen-3xl md:p-6 p-4 w-full overflow-x-hidden pt-16 lg:pt-20 pb-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default AppLayout;
