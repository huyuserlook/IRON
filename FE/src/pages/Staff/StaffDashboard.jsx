import { useState, useEffect } from "react";
import staffApi from "../../api/staffApi";
import { formatCurrency } from "../../utils/formatCurrency";
import { ShoppingBag, Calendar, Bike } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div className="flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);

const StaffDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, bookings: 0, motorcycles: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      staffApi.getOrders({ page: 0, size: 5 }),
      staffApi.getBookings({ page: 0, size: 5 }),
      staffApi.getMotorcycles({ page: 0, size: 1 }),
    ]).then(([ordersRes, bookingsRes, motorcyclesRes]) => {
      const ordersData = ordersRes?.data ?? ordersRes;
      const bookingsData = bookingsRes?.data ?? bookingsRes;
      const motorcyclesData = motorcyclesRes?.data ?? motorcyclesRes;

      setRecentOrders(ordersData?.content || []);
      setRecentBookings(bookingsData?.content || []);
      setStats({
        orders: ordersData?.totalElements || 0,
        bookings: bookingsData?.totalElements || 0,
        motorcycles: motorcyclesData?.content?.length || 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Nhân viên</h1>
        <p className="mt-1 text-sm text-gray-600">Tổng quan hoạt động của bạn</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={ShoppingBag} label="Đơn hàng" value={stats.orders} color="bg-blue-500" />
        <StatCard icon={Calendar} label="Lịch lái thử" value={stats.bookings} color="bg-purple-500" />
        <StatCard icon={Bike} label="Xe máy" value={stats.motorcycles} color="bg-green-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800">Đơn hàng gần đây</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có đơn hàng nào</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.orderCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                      order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-purple-500" />
            <h2 className="text-lg font-semibold text-slate-800">Lịch lái thử gần đây</h2>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có lịch lái thử nào</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{booking.customerName}</p>
                    <p className="text-xs text-slate-500">{booking.motorcycleName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{booking.bookingDate}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      booking.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                      booking.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
