import { AdminDashboard } from '@/components/admin/dashboard-component';
import { useQuery } from '@tanstack/react-query';

export const Dashboard = () => {

  const { data: currentUser } = useQuery({
    queryKey: [`/api/isAdmin`],
  });

  return <AdminDashboard />;
};

