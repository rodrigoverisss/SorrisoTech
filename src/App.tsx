import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import Schedule from '@/pages/Schedule';
import Records from '@/pages/Records';
import Treatments from '@/pages/Treatments';
import Financial from '@/pages/Financial';
import Stock from '@/pages/Stock';
import Invoices from '@/pages/Invoices';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import WhatsAppConfig from '@/pages/WhatsAppConfig';
import AuditLogs from '@/pages/AuditLogs';
import CustomFields from '@/pages/CustomFields';
import Documents from '@/pages/Documents';
import NotFound from '@/pages/NotFound';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 pl-64">
                  <Header />
                  <main className="mt-16 p-6">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/records" element={<Records />} />
                      <Route path="/treatments" element={<Treatments />} />
                      <Route path="/financial" element={<Financial />} />
                      <Route path="/stock" element={<Stock />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/whatsapp" element={<WhatsAppConfig />} />
                      <Route path="/audit" element={<AuditLogs />} />
                      <Route path="/custom-fields" element={<CustomFields />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
