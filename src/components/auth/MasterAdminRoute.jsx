import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export default function MasterAdminRoute({ children }) {
  const { user, token, isLoading, isMasterAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Chỉ cho phép user từ DB QUANLY (tenant_id = null)
  if (!isMasterAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}


