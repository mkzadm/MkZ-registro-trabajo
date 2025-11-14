
import React, { useState, useMemo, useCallback } from 'react';
import { User, UserRole } from './types';
import { apiService } from './services/apiService';

import Login from './components/Login';
import Clock from './components/Clock';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';

export const AuthContext = React.createContext<{
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}>({
  user: null,
  login: async () => {},
  logout: () => {},
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = useCallback(async (email: string, pass: string) => {
    const loggedInUser = await apiService.login(email, pass);
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const authContextValue = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  const renderContent = () => {
    if (!user) {
      return <Login />;
    }
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow p-4 md:p-8">
          {user.role === UserRole.ADMIN ? <AdminDashboard /> : <Clock />}
        </main>
      </div>
    );
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
        {renderContent()}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
