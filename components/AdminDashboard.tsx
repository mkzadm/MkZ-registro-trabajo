import React, { useState } from 'react';
import RecordsTable from './RecordsTable';
import UsersTable from './UsersTable';
import HoursChart from './HoursChart';
import DailyHoursTable from './DailyHoursTable';

type Tab = 'records' | 'users' | 'reports';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('records');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'records':
        return <RecordsTable />;
      case 'users':
        return <UsersTable />;
      case 'reports':
        return (
          <div className="space-y-8">
            <HoursChart />
            <DailyHoursTable />
          </div>
        );
      default:
        return null;
    }
  };
  
  // Fix: Corrected the component's props typing using React.FC to resolve issues with 'children' prop detection.
  const TabButton: React.FC<{ tab: Tab; children: React.ReactNode }> = ({ tab, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
      </div>
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
        <TabButton tab="records">Time Records</TabButton>
        <TabButton tab="users">Manage Users</TabButton>
        <TabButton tab="reports">Reports</TabButton>
      </div>
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;