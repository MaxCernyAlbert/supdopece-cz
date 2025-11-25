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

  // List view
  return (
    <div className={`card ${!product.available ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Image placeholder */}
        <div className="sm:w-32 sm:h-32 h-24 bg-gradient-to-br from-bread-light to-bread-medium flex items-center justify-center flex-shrink-0 rounded-lg">
          <span className="text-5xl sm:text-4xl">
            {product.category === 'chleby' && '🍞'}
            {product.category === 'pecivo' && '🥖'}
            {product.category === 'sladke' && '🥐'}
            {product.category === 'slane' && '🥨'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-bread-dark">{product.name}</h3>
              <span className="text-sm text-gray-500 ml-2">{product.weight}</span>
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

          <div className="flex justify-between items-center mt-3">
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
    </div>
  );
}
