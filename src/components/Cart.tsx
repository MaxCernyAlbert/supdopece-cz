'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export function Cart() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold text-bread-dark mb-4">🛒 Košík</h2>
        <p className="text-gray-500 text-center py-8">
          Váš košík je prázdný
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-bread-dark mb-4">🛒 Košík</h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-3 pb-3 border-b border-gray-100">
            <div className="flex-grow">
              <h4 className="font-medium text-bread-dark">{item.product.name}</h4>
              <p className="text-sm text-gray-500">{item.product.price} Kč/ks</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>

            <div className="w-20 text-right">
              <p className="font-medium">{item.product.price * item.quantity} Kč</p>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Odebrat
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between text-lg font-bold">
          <span>Celkem</span>
          <span className="text-primary-600">{totalPrice} Kč</span>
        </div>
      </div>

      <Link href="/objednavka" className="btn-primary w-full block text-center">
        Pokračovat k objednávce
      </Link>
    </div>
  );
}
