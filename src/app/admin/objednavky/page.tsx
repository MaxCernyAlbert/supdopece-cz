'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils';
import { saveAdminSession, getAdminSession, clearAdminSession } from '@/lib/adminAuth';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  pickupDate: string;
  pickupTime: string;
  note?: string;
  paymentMethod: 'card' | 'onPickup' | 'qrCode' | 'online' | 'cash' | 'card_on_pickup'; // Support old and new types
  status: 'new' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
}

const paymentMethodLabels: Record<string, string> = {
  card: '💳 Kartou online',
  onPickup: '💵 Při vyzvednutí (hotově/kartou)',
  qrCode: '📱 QR kód (bankovní převod)',
  // Legacy payment methods (backwards compatibility)
  online: '💳 Kartou online',
  cash: '💵 Hotově',
  card_on_pickup: '💳 Kartou při vyzvednutí',
};

const statusLabels = {
  new: '🆕 Nová',
  confirmed: '✅ Potvrzená',
  ready: '🎉 Připravená',
  completed: '✔️ Vyzvednuta',
  cancelled: '❌ Zrušená',
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterPickupDate, setFilterPickupDate] = useState('');

  // Load customer filter from URL params
  useEffect(() => {
    const customerParam = searchParams.get('customer');
    if (customerParam) {
      setFilterCustomer(customerParam);
    }
  }, [searchParams]);

  // Auto-login if session exists
  useEffect(() => {
    const sessionPassword = getAdminSession();
    if (sessionPassword) {
      setAdminPassword(sessionPassword);
      // Trigger auto-login
      handleLoginWithPassword(sessionPassword);
    } else {
      setIsCheckingSession(false);
    }
  }, []);

  const handleLoginWithPassword = async (password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders?password=${password}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
        setIsAuthenticated(true);
        saveAdminSession(password); // Save session on successful login
      } else {
        setError(data.error || 'Neplatné heslo');
        clearAdminSession();
      }
    } catch (err) {
      setError('Chyba při načítání objednávek');
      clearAdminSession();
    } finally {
      setIsLoading(false);
      setIsCheckingSession(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLoginWithPassword(adminPassword);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    clearAdminSession();
  };

  // Filter orders by customer and pickup date
  const filteredOrders = orders.filter((order) => {
    const matchesCustomer = !filterCustomer ||
      order.customerName.toLowerCase().includes(filterCustomer.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(filterCustomer.toLowerCase()) ||
      order.customerPhone?.includes(filterCustomer);

    const matchesPickupDate = !filterPickupDate ||
      order.pickupDate === filterPickupDate;

    return matchesCustomer && matchesPickupDate;
  });

  // Get unique pickup dates for filter dropdown
  const uniquePickupDates = Array.from(new Set(orders.map(o => o.pickupDate))).sort();

  // Sort filtered orders by pickup time when date filter is active
  const sortedFilteredOrders = filterPickupDate
    ? [...filteredOrders].sort((a, b) => a.pickupTime.localeCompare(b.pickupTime))
    : filteredOrders;

  // Product summary for selected date
  const productSummary = filterPickupDate
    ? sortedFilteredOrders
        .filter(o => o.status !== 'cancelled')
        .flatMap(o => o.items)
        .reduce((acc, item) => {
          const key = item.productName;
          if (!acc[key]) {
            acc[key] = { name: item.productName, quantity: 0 };
          }
          acc[key].quantity += item.quantity;
          return acc;
        }, {} as Record<string, { name: string; quantity: number }>)
    : null;

  // Statistiky
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const newOrders = orders.filter((o) => o.status === 'new').length;

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Načítám...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <span className="text-6xl">📊</span>
            <h1 className="text-2xl font-bold text-bread-dark mt-4 mb-2">
              Historie objednávek
            </h1>
            <p className="text-gray-600">Zadejte admin heslo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin heslo
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="input-field"
                placeholder="admin123"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Načítám...' : 'Zobrazit objednávky'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-primary-600">
              ← Zpět na admin panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-bread-dark">📊 Objednávky</h1>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-secondary text-sm py-2">
            👨‍💼 Admin panel
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Odhlásit
          </button>
        </div>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-1">Celkem objednávek</div>
          <div className="text-3xl font-bold text-bread-dark">{totalOrders}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-1">Celkový obrat</div>
          <div className="text-3xl font-bold text-primary-600">{formatPrice(totalRevenue)}&nbsp;Kč</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-1">Nové objednávky</div>
          <div className="text-3xl font-bold text-green-600">{newOrders}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="input-field"
            placeholder="🔍 Hledat podle jména nebo emailu zákazníka..."
          />
          <select
            value={filterPickupDate}
            onChange={(e) => setFilterPickupDate(e.target.value)}
            className="input-field"
          >
            <option value="">📅 Všechna data vyzvednutí</option>
            {uniquePickupDates.map((date) => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product summary for selected date */}
      {filterPickupDate && productSummary && Object.keys(productSummary).length > 0 && (
        <div className="card p-6 mb-6 bg-yellow-50 border-2 border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">
            🥖 Přehled produktů k přípravě na {formatDate(filterPickupDate)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.values(productSummary)
              .sort((a, b) => b.quantity - a.quantity)
              .map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-lg p-3 border border-yellow-300"
                >
                  <div className="text-2xl font-bold text-primary-600">
                    {item.quantity}x
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {item.name}
                  </div>
                </div>
              ))}
          </div>
          <p className="text-sm text-yellow-700 mt-4">
            Celkem {sortedFilteredOrders.filter(o => o.status !== 'cancelled').length} objednávek seřazených podle času vyzvednutí
          </p>
        </div>
      )}

      {/* Seznam objednávek */}
      {sortedFilteredOrders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">
            {filterCustomer ? 'Žádné objednávky nenalezeny' : 'Zatím žádné objednávky'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedFilteredOrders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Levá část - info o objednávce */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-bread-dark">
                        {order.customerName}
                      </h3>
                      <p className="text-sm text-gray-600">{order.customerEmail}</p>
                      <p className="text-sm text-gray-600">📞 {order.customerPhone}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Objednané položky:
                    </div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {item.quantity}x {item.productName} - {formatPrice(item.price * item.quantity)}&nbsp;Kč
                      </div>
                    ))}
                  </div>

                  {order.note && (
                    <div className="text-sm text-gray-600 italic mb-2">
                      💬 Poznámka: {order.note}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                      📅 {formatDate(order.pickupDate)} v {order.pickupTime}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {paymentMethodLabels[order.paymentMethod]}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                {/* Pravá část - cena */}
                <div className="text-right md:text-left md:min-w-[150px]">
                  <div className="text-sm text-gray-500 mb-1">Celkem</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatPrice(order.totalPrice)}&nbsp;Kč
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{order.id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="card p-8 text-center">
          <span className="text-4xl">⏳</span>
          <p className="mt-4 text-gray-600">Načítám...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
