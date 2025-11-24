'use client';

import { Product, ALLERGENS } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (product.available) {
      addItem(product);
    }
  };

  return (
    <div className={`card ${!product.available ? 'opacity-60' : ''}`}>
      {/* Obrázek - placeholder */}
      <div className="h-48 bg-gradient-to-br from-bread-light to-bread-medium flex items-center justify-center">
        <span className="text-6xl">
          {product.category === 'chleby' && '🍞'}
          {product.category === 'pecivo' && '🥖'}
          {product.category === 'sladke' && '🥐'}
          {product.category === 'slane' && '🥨'}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-bread-dark">{product.name}</h3>
          <span className="text-sm text-gray-500">{product.weight}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3">{product.description}</p>

        {/* Alergeny */}
        {product.allergens.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-gray-500">
              Alergeny:{' '}
              {product.allergens.map((a, i) => (
                <span key={a} title={ALLERGENS[a]}>
                  {a}
                  {i < product.allergens.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary-600">
            {product.price} Kč
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!product.available}
            className="btn-primary text-sm py-2 px-4"
          >
            {product.available ? 'Přidat do košíku' : 'Vyprodáno'}
          </button>
        </div>
      </div>
    </div>
  );
}
