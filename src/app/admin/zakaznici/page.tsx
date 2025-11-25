'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { saveAdminSession, getAdminSession, clearAdminSession } from '@/lib/adminAuth';

interface Customer {
  name: string;
  email?: string;
  phone?: string;
  token: string;
  createdAt: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalPrice: number;
  createdAt: string;
}

interface CustomerStats {
  totalOrders: number;
  ordersThisYear: number;
  ordersThisMonth: number;
  totalSpent: number;
}

export default function CustomersPage() {
  // Check session synchronously on init
  const initialSession = typeof window !== 'undefined' ? getAdminSession() : null;

  const [adminPassword, setAdminPassword] = useState(initialSession || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialSession);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerStats, setCustomerStats] = useState<Record<string, CustomerStats>>({});
  const [isLoading, setIsLoading] = useState(!!initialSession);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modal state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [sendingLinkTo, setSendingLinkTo] = useState<string | null>(null);

  // Auto-login if session exists
  useEffect(() => {
    const sessionPassword = getAdminSession();
    if (sessionPassword) {
      handleLoginWithPassword(sessionPassword);
    }
  }, []);

  // Calculate customer stats when orders change
  useEffect(() => {
    if (orders.length > 0 && customers.length > 0) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const stats: Record<string, CustomerStats> = {};

      customers.forEach(customer => {
        const customerOrders = orders.filter(
          o => o.customerEmail === customer.email || o.customerPhone === customer.phone
        );

        stats[customer.token] = {
          totalOrders: customerOrders.length,
          ordersThisYear: customerOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getFullYear() === currentYear;
          }).length,
          ordersThisMonth: customerOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
          }).length,
          totalSpent: customerOrders.reduce((sum, o) => sum + o.totalPrice, 0),
        };
      });

      setCustomerStats(stats);
    }
  }, [orders, customers]);

  const handleLoginWithPassword = async (password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const [customersRes, ordersRes] = await Promise.all([
        fetch(`/api/customers?password=${password}`),
        fetch(`/api/orders?password=${password}`)
      ]);

      const customersData = await customersRes.json();
      const ordersData = await ordersRes.json();

      if (customersRes.ok) {
        setCustomers(customersData.customers);
        setIsAuthenticated(true);
        saveAdminSession(password);
      } else {
        setError(customersData.error || 'Neplatné heslo');
        clearAdminSession();
      }

      if (ordersRes.ok) {
        setOrders(ordersData.orders || []);
      }
    } catch (err) {
      setError('Chyba při načítání zákazníků');
      clearAdminSession();
    } finally {
      setIsLoading(false);
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

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/customers/${editingCustomer.token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          name: editForm.name,
          email: editForm.email || undefined,
          phone: editForm.phone || undefined,
        }),
      });

      if (res.ok) {
        // Update local state
        setCustomers(prev => prev.map(c =>
          c.token === editingCustomer.token
            ? { ...c, name: editForm.name, email: editForm.email || undefined, phone: editForm.phone || undefined }
            : c
        ));
        setEditingCustomer(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Chyba při ukládání');
      }
    } catch {
      alert('Chyba při komunikaci se serverem');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`Opravdu chcete smazat zákazníka "${customer.name}"?`)) return;

    try {
      const res = await fetch(`/api/customers/${customer.token}?password=${adminPassword}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.token !== customer.token));
      } else {
        const data = await res.json();
        alert(data.error || 'Chyba při mazání');
      }
    } catch {
      alert('Chyba při komunikaci se serverem');
    }
  };

  const handleSendMagicLink = async (customer: Customer) => {
    if (!customer.phone) return;

    setSendingLinkTo(customer.token);
    try {
      const res = await fetch('/api/customers/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          token: customer.token,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Magic link odeslán na ${customer.phone}`);
      } else {
        alert(data.error || 'Chyba při odesílání');
      }
    } catch {
      alert('Chyba při komunikaci se serverem');
    } finally {
      setSendingLinkTo(null);
    }
  };

  // Filtrování zákazníků
  const filteredCustomers = searchTerm
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)
      )
    : customers;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Zkopírováno!');
  };

  const getCustomerLink = (token: string) => {
    return `${window.location.origin}/u/${token}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <span className="text-6xl">👥</span>
            <h1 className="text-2xl font-bold text-bread-dark mt-4 mb-2">
              Seznam zákazníků
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
                placeholder="Zadejte heslo"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Načítám...' : 'Zobrazit zákazníky'}
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
        <h1 className="text-3xl font-bold text-bread-dark">👥 Zákazníci</h1>
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

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-1">Celkem zákazníků</div>
          <div className="text-3xl font-bold text-bread-dark">{customers.length}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-1">Se SMS přihlášením</div>
          <div className="text-3xl font-bold text-primary-600">
            {customers.filter((c) => c.phone).length}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-1">Jen magic link</div>
          <div className="text-3xl font-bold text-green-600">
            {customers.filter((c) => !c.phone).length}
          </div>
        </div>
      </div>

      {/* Vyhledávání */}
      <div className="card p-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          placeholder="🔍 Hledat podle jména, emailu nebo telefonu..."
        />
      </div>

      {/* Seznam zákazníků */}
      {filteredCustomers.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'Žádní zákazníci nenalezeni' : 'Zatím žádní zákazníci'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => {
            const stats = customerStats[customer.token] || { totalOrders: 0, ordersThisYear: 0, ordersThisMonth: 0, totalSpent: 0 };

            return (
              <div key={customer.token} className="card p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Levá část - info o zákazníkovi */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-bread-dark">
                          {customer.name}
                        </h3>
                        {customer.email && (
                          <p className="text-sm text-gray-600">✉️ {customer.email}</p>
                        )}
                        {customer.phone && (
                          <p className="text-sm text-gray-600">📱 {customer.phone}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(customer.createdAt)}
                      </span>
                    </div>

                    {/* Statistiky objednávek */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                        📦 Celkem: {stats.totalOrders} obj.
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                        📅 Letos: {stats.ordersThisYear}
                      </span>
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
                        🗓️ Tento měsíc: {stats.ordersThisMonth}
                      </span>
                      {customer.phone && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                          📱 SMS
                        </span>
                      )}
                    </div>

                    {/* Akce */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        onClick={() => handleEditClick(customer)}
                        className="btn-secondary text-xs py-2 px-3"
                      >
                        ✏️ Upravit
                      </button>
                      <Link
                        href={`/admin/objednavky?customer=${encodeURIComponent(customer.name)}`}
                        className="btn-secondary text-xs py-2 px-3"
                      >
                        📋 Objednávky
                      </Link>
                      <button
                        onClick={() => copyToClipboard(getCustomerLink(customer.token))}
                        className="btn-secondary text-xs py-2 px-3"
                      >
                        📋 Kopírovat odkaz
                      </button>
                      {customer.phone && (
                        <button
                          onClick={() => handleSendMagicLink(customer)}
                          disabled={sendingLinkTo === customer.token}
                          className="btn-secondary text-xs py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700"
                        >
                          {sendingLinkTo === customer.token ? '⏳ Odesílám...' : '📲 Odeslat link SMS'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCustomer(customer)}
                        className="text-xs py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️ Smazat
                      </button>
                    </div>

                    {/* Magic link */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-grow overflow-hidden">
                          <p className="text-xs text-gray-500 mb-1">Přihlašovací odkaz:</p>
                          <code className="text-xs text-gray-800 break-all">
                            {getCustomerLink(customer.token)}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pravá část - ID a útrata */}
                  <div className="text-right md:text-left md:min-w-[150px]">
                    <div className="text-sm text-gray-500 mb-1">Celková útrata</div>
                    <div className="text-xl font-bold text-primary-600">
                      {stats.totalSpent.toLocaleString('cs-CZ')}&nbsp;Kč
                    </div>
                    <div className="text-xs text-gray-500 mt-2">ID: {customer.token}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rychlý přístup */}
      <div className="mt-8 card p-6">
        <h3 className="font-bold text-bread-dark mb-4">⚡ Rychlé akce</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="btn-primary">
            ➕ Přidat nového zákazníka
          </Link>
          <Link href="/admin/objednavky" className="btn-secondary">
            📊 Zobrazit objednávky
          </Link>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-bread-dark mb-4">
              ✏️ Upravit zákazníka
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jméno *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                />
              </div>

              <p className="text-sm text-gray-600">
                * Vyplňte alespoň jeden kontakt (email nebo telefon)
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editForm.name || (!editForm.email && !editForm.phone)}
                className="btn-primary flex-1"
              >
                {isSaving ? '⏳ Ukládám...' : '💾 Uložit'}
              </button>
              <button
                onClick={() => setEditingCustomer(null)}
                className="btn-secondary flex-1"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
