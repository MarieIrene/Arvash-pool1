import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DevicesList } from './pages/admin/DevicesList';
import { DeviceDetails } from './pages/admin/DeviceDetails';
import { TransactionsPage } from './pages/admin/Transactions';
import { OrganizationsList } from './pages/admin/OrganizationsList';
import { OrganizationDetails } from './pages/admin/OrganizationDetails';
import { Payments } from './pages/admin/Payments';
import { Reports } from './pages/admin/Reports';
import { Provisioning } from './pages/admin/Provisioning';
import { Flasher } from './pages/admin/Flasher';
import { Support } from './pages/admin/Support';
import { SupportTicketDetail } from './pages/admin/SupportTicketDetail';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { OwnerDevicesList } from './pages/owner/OwnerDevicesList';
import { OwnerDeviceDetails } from './pages/owner/OwnerDeviceDetails';
import { OwnerTransactions } from './pages/owner/OwnerTransactions';
import { OwnerLocations } from './pages/owner/OwnerLocations';
import { OwnerRevenue } from './pages/owner/OwnerRevenue';
import { Settings } from './pages/Settings';
import { PaymentReceipt } from './pages/customer/PaymentReceipt';
import { VoucherCheck } from './pages/customer/VoucherCheck';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  return <Navigate to={user.role === 'SUPERADMIN' ? '/admin/dashboard' : '/owner/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Customer touchpoints — no auth, no app shell */}
      <Route path="/pay/receipt/:transactionId" element={<PaymentReceipt />} />
      <Route path="/voucher/check" element={<VoucherCheck />} />

      {/* Platform Administrator */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="SUPERADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/devices" element={<ProtectedRoute role="SUPERADMIN"><DevicesList /></ProtectedRoute>} />
      <Route path="/admin/devices/:id" element={<ProtectedRoute role="SUPERADMIN"><DeviceDetails /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute role="SUPERADMIN"><TransactionsPage /></ProtectedRoute>} />
      <Route path="/admin/organizations" element={<ProtectedRoute role="SUPERADMIN"><OrganizationsList /></ProtectedRoute>} />
      <Route path="/admin/organizations/:id" element={<ProtectedRoute role="SUPERADMIN"><OrganizationDetails /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute role="SUPERADMIN"><Payments /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="SUPERADMIN"><Reports /></ProtectedRoute>} />
      <Route path="/admin/provisioning" element={<ProtectedRoute role="SUPERADMIN"><Provisioning /></ProtectedRoute>} />
      <Route path="/admin/flasher" element={<ProtectedRoute role="SUPERADMIN"><Flasher /></ProtectedRoute>} />
      <Route path="/admin/support" element={<ProtectedRoute role="SUPERADMIN"><Support /></ProtectedRoute>} />
      <Route path="/admin/support/:id" element={<ProtectedRoute role="SUPERADMIN"><SupportTicketDetail /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="SUPERADMIN"><Settings /></ProtectedRoute>} />

      {/* Pool Owner */}
      <Route path="/owner/dashboard" element={<ProtectedRoute role="OWNER"><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/locations" element={<ProtectedRoute role="OWNER"><OwnerLocations /></ProtectedRoute>} />
      <Route path="/owner/devices" element={<ProtectedRoute role="OWNER"><OwnerDevicesList /></ProtectedRoute>} />
      <Route path="/owner/devices/:id" element={<ProtectedRoute role="OWNER"><OwnerDeviceDetails /></ProtectedRoute>} />
      <Route path="/owner/transactions" element={<ProtectedRoute role="OWNER"><OwnerTransactions /></ProtectedRoute>} />
      <Route path="/owner/revenue" element={<ProtectedRoute role="OWNER"><OwnerRevenue /></ProtectedRoute>} />
      <Route path="/owner/settings" element={<ProtectedRoute role="OWNER"><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
