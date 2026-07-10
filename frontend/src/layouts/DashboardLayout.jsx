import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import './DashboardLayout.css';

export default function DashboardLayout() {
  return (
    <div className="pp-dashboard-layout">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Workspace Area */}
      <main className="pp-dashboard-main pp-scroll">
        <Outlet />
      </main>
    </div>
  );
}
