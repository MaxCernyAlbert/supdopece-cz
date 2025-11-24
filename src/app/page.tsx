'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';
import { products, categories } from '@/data/products';
import { config } from '@/data/config';
import { ProductCategory } from '@/types';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero sekce */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-bread-dark mb-4">
          {config.name}
        </h1>
        <p className="text-xl text-gray-600 mb-2">{config.tagline}</p>
        <p className="text-lg text-gray-500">{config.description}</p>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Katalog produktů */}
        <div className="flex-grow">
          {/* Kategorie */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-primary-100'
              }`}
            >
              Vše
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as ProductCategory)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-primary-100'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Produkty */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Košík - sidebar */}
        <aside className="lg:w-96 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            <Cart />
          </div>
        </aside>
      </div>
    </div>
  );
}
