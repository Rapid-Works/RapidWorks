import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export const dynamicParams = true;

export function generateStaticParams() {
  // Return empty array - routes will be handled client-side
  return [];
}

export default function DashboardTaskPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
