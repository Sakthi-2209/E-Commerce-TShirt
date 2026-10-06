import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package, ShoppingBag, Users, IndianRupee } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/auth/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.revenue}`, icon: IndianRupee },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingBag },
    { title: 'Active Products', value: stats.products, icon: Package },
    { title: 'Customers', value: stats.customers, icon: Users },
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '2rem' }}>Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{stat.title}</div>
                <Icon size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600 }}>{stat.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
