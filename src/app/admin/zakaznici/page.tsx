'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { saveAdminSession, getAdminSession, clearAdminSession } from '@/lib/adminAuth';

interface Customer {
  name: string;
  email: string;
  phone?: string;
  token: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-login if session exists
  useEffect(() => {
    const sessionPassword = getAdminSession();
    if (sessionPassword) {
      setAdminPassword(sessionPassword);
      // Trigger auto-login
      handleLoginWithPassword(sessionPassword);
    }
  }, []);

  const handleLoginWithPassword = async (password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/customers?password=${password}`);
      const data = await res.json();

      if (res.ok) {
        setCustomers(data.customers);
        setIsAuthenticated(true);
        saveAdminSession(password); // Save session on successful login
      } else {
        setError(data.error || 'Neplatné heslo');
        clearAdminSession();
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

  // Filtrování zákazníků
  const filteredCustomers = searchTerm
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          {filteredCustomers.map((customer) => (
            <div key={customer.token} className="card p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Levá část - info o zákazníkovi */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-bread-dark">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-600">✉️ {customer.email}</p>
                      {customer.phone && (
                        <p className="text-sm text-gray-600">📱 {customer.phone}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(customer.createdAt)}
                    </span>
                  </div>

                  {/* Přihlašovací metody */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {customer.phone ? (
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                        📱 SMS přihlášení
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                        ❌ Bez SMS
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      🔗 Magic link
                    </span>
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
                      <button
                        onClick={() => copyToClipboard(getCustomerLink(customer.token))}
                        className="btn-secondary text-xs py-2 px-3 flex-shrink-0"
                      >
                        📋 Kopírovat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pravá část - ID */}
                <div className="text-right md:text-left md:min-w-[150px]">
                  <div className="text-sm text-gray-500 mb-1">ID</div>
                  <div className="text-sm font-mono text-gray-700 break-all">
                    {customer.token}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
