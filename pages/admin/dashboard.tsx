// pages/admin/dashboard.tsx
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  DollarSign,
  Wallet,
  Settings,
  X,
  Menu,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data for admin dashboard
const mockData = {
  customers: [
    { id: 'NguyenTran123', balance: 0, ipLogin: '171.251.237.143, 172.7124.65', status: 'Trạng thái' },
    { id: 'vuthanhtra', balance: 420000, ipLogin: '171.224.178.192, 104.2317.39', status: 'Trạng thái' },
    { id: 'NguyenThiTuyet', balance: 0, ipLogin: '2a09:bacd:4592:63c:30, 172.68.2116', status: 'Trạng thái' },
    { id: 'MaThiThanh', balance: 0, ipLogin: '171.254.200.151, 172.68.164.127', status: 'Trạng thái' },
  ],
  depositRequests: [
    { time: '28/06/2025 21:31:58', user: 'nguoikhongten22@gmail.com', amount: 3000000, bank: 'Xem', status: 'Chờ duyệt', action: '' },
    { time: '28/06/2025 19:21:08', user: 'ThuThao85', amount: 3000000, bank: 'Xem', status: 'Đã duyệt', action: '' },
    { time: '28/06/2025 19:09:03', user: 'phamhongocchinh16814@gmail.com', amount: 3000000, bank: 'Xem', status: 'Chờ duyệt', action: '' },
    { time: '28/06/2025 19:04:49', user: 'phamhongocchinh16814@gmail.com', amount: 3000000, bank: 'Xem', status: 'Chờ duyệt', action: '' },
    { time: '28/06/2025 17:36:15', user: '', amount: 3000000, bank: 'Xem', status: 'Đã duyệt', action: '' },
  ],
  withdrawalRequests: [
    { time: '28/06/2025 23:00:32', user: 'Dinh Thi Tu Anh', amount: 5000000, deducted: 4750000, bank: 'Vietinbank', account: '10487691067', fullName: 'DINH THI TU ANH', status: 'Chờ duyệt', action: '' },
    { time: '28/06/2025 23:00:04', user: 'Dinh Thi Tu Anh', amount: 5000000, deducted: 4750000, bank: 'Vietinbank', account: '10487691067', fullName: 'DINH THI TU ANH', status: 'Chờ duyệt', action: '' },
  ],
  accountSummary: {
    totalAccounts: 131,
    totalBalance: 10498420000,
    totalDeposits: 6980829240,
    totalWithdrawals: 5600000,
  },
  trades: [
    { time: '28/06/2025 10:19:00', user: 'user1@example.com', amount: 5000000, type: 'deposit', status: 'completed' },
    { time: '28/06/2025 10:18:00', user: 'user2@example.com', amount: 3000000, type: 'withdraw', status: 'pending' },
  ],
};

interface DashboardProps {
  data: {
    customers: Array<{
      id: string;
      balance: number;
      ipLogin: string;
      status: string;
    }>;
    depositRequests: Array<{
      time: string;
      user: string;
      amount: number;
      bank: string;
      status: string;
      action: string;
    }>;
    withdrawalRequests: Array<{
      time: string;
      user: string;
      amount: number;
      deducted: number;
      bank: string;
      account: string;
      fullName: string;
      status: string;
      action: string;
    }>;
    accountSummary: {
      totalAccounts: number;
      totalBalance: number;
      totalDeposits: number;
      totalWithdrawals: number;
    };
    trades: Array<{
      time: string;
      user: string;
      amount: number;
      type: string;
      status: string;
    }>;
  };
}

const menuItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
  { id: 'users', label: 'Khách hàng', icon: <Users size={20} /> },
  { id: 'trades', label: 'Lịch sử đặt lệnh', icon: <Clock size={20} /> },
  { id: 'deposits', label: 'Yêu cầu nạp tiền', icon: <DollarSign size={20} /> },
  { id: 'withdrawals', label: 'Yêu cầu rút tiền', icon: <Wallet size={20} /> },
  { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} /> },
];

export default function Dashboard({ data }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [startDate, setStartDate] = useState('01/06/2025');
  const [endDate, setEndDate] = useState('29/06/2025');
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleNavigation = (itemId: string) => setActiveItem(itemId);

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tổng quan</h2>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>Tài khoản mới</div>
              <div>Tổng tiền cố định</div>
              <div>Tổng tiền rút</div>
              <div>Tổng nạp</div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center mt-2">
              <div>{data.accountSummary.totalAccounts}</div>
              <div>{data.accountSummary.totalBalance.toLocaleString()} đ</div>
              <div>{data.accountSummary.totalWithdrawals.toLocaleString()} đ</div>
              <div>{data.accountSummary.totalDeposits.toLocaleString()} đ</div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tài khoản mới</h2>
              <div className="flex space-x-2">
                <select className="border rounded p-1">
                  <option>Trạng thái</option>
                  <option>Tất cả</option>
                </select>
                <input type="date" className="border rounded p-1" defaultValue="01/06/2025" />
                <input type="date" className="border rounded p-1" defaultValue="29/06/2025" />
                <button className="bg-green-500 text-white px-2 py-1 rounded">Áp dụng</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên đăng nhập</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số dư</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP login</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.customers.map((customer, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{customer.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{customer.balance.toLocaleString()} đ</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{customer.ipLogin}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{customer.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'trades':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lịch sử đặt lệnh</h2>
              <div className="flex space-x-2">
                <input type="date" className="border rounded p-1" defaultValue="01/06/2025" />
                <input type="date" className="border rounded p-1" defaultValue="29/06/2025" />
                <button className="bg-green-500 text-white px-2 py-1 rounded">Áp dụng</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.trades.map((trade, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{trade.time}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{trade.user}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{trade.amount.toLocaleString()} đ</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{trade.type}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{trade.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'deposits':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Yêu cầu nạp tiền</h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Khách hàng"
                  className="border rounded p-1"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="all">Trạng thái</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                </select>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded p-1"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded p-1"
                />
                <button className="bg-green-500 text-white px-2 py-1 rounded">Áp dụng</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.depositRequests.map((request, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.time}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.user}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.amount.toLocaleString()} đ</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.bank}</td>
                      <td className="px-4 py-2 text-sm">
                        {request.status === 'Chờ duyệt' ? (
                          <span className="text-yellow-500">Chờ duyệt</span>
                        ) : (
                          <span className="text-green-500">Đã duyệt</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-500 text-white border-green-500 hover:bg-green-600 mr-2"
                          disabled={request.status === 'Đã duyệt'}
                        >
                          Phê duyệt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-500 text-white border-red-500 hover:bg-red-600"
                          disabled={request.status === 'Đã duyệt'}
                        >
                          Tư chối
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'withdrawals':
        return (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Yêu cầu rút tiền</h2>
              <div className="flex space-x-2">
                <input type="date" className="border rounded p-1" defaultValue="01/06/2025" />
                <input type="date" className="border rounded p-1" defaultValue="29/06/2025" />
                <button className="bg-green-500 text-white px-2 py-1 rounded">Áp dụng</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tiền rút thực tế</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngân hàng nhận tiền</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tài khoản</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chủ tài khoản</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.withdrawalRequests.map((request, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.time}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.user}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.amount.toLocaleString()} đ</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.deducted.toLocaleString()} đ</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.bank}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.account}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.fullName}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin ngân hàng nạp tiền</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên ngân hàng</label>
                  <input
                    type="text"
                    defaultValue="ABBANK"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tài khoản</label>
                  <input
                    type="text"
                    defaultValue="0387473721"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chủ tài khoản</label>
                  <input
                    type="text"
                    defaultValue="VU VAN MIEN"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tiền nạp tối thiểu</label>
                  <input
                    type="text"
                    defaultValue="100.000"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tiền rút tối thiểu</label>
                  <input
                    type="text"
                    defaultValue="100.000"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Link CSKH</label>
                  <input
                    type="text"
                    defaultValue="https://t.me/DICHVUCSKHSE"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <Button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                Lưu
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <span className="text-sm font-bold">AP</span>
            </div>
          )}
          <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center p-3 rounded-md text-sm font-medium ${
                    activeItem === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find((item) => item.id === activeItem)?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <span className="sr-only">Notifications</span>
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                </button>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  {sidebarOpen && <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      data: mockData,
    },
  };
};