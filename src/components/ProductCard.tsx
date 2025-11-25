'use client';

import { Product, ALLERGENS } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (product.available) {
      addItem(product);
    }
  };

  // Grid view (default)
  if (viewMode === 'grid') {
    return (
      <div className={`card ${!product.available ? 'opacity-60' : ''}`}>
        {/* Image placeholder */}
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

          {/* Allergens */}
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

  // List view - text only, no images
  return (
    <div className={`card ${!product.available ? 'opacity-60' : ''}`}>
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Product info */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <h3 className="text-lg font-semibold text-bread-dark">{product.name}</h3>
            <span className="text-sm text-gray-500">{product.weight}</span>
            <span className="text-lg font-bold text-primary-600">
              {product.price} Kč
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-2">{product.description}</p>

          {/* Allergens */}
          {product.allergens.length > 0 && (
            <span className="text-xs text-gray-500">
              Alergeny:{' '}
              {product.allergens.map((a, i) => (
                <span key={a} title={ALLERGENS[a]}>
                  {a}
                  {i < product.allergens.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Right: Add button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={!product.available}
            className="btn-primary text-sm py-2 px-4 w-full sm:w-auto"
          >
            {product.available ? 'Přidat' : 'Vyprodáno'}
          </button>
        </div>
      </div>
    </div>
  );
}
