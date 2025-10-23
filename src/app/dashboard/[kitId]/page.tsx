import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardKitPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
