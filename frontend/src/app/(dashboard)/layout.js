import DashboardLayout from "@/layouts/DashboardLayout";
import AdminRoute from "@/components/shared/AdminRoute";

export default function Layout({ children }) {
  return (
    <AdminRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminRoute>
  );
}
