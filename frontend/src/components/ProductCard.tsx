import { useState } from 'react';
import { type Product } from '../utils/api';

interface Props {
  product: Product;
  onTrack?: (product: Product) => void;
  onUntrack?: (id: number) => void;
  tracked?: boolean;
}

const PLATFORM_STYLE: Record<string, string> = {
  blinkit: 'bg-yellow-100 text-yellow-800',
  zepto:   'bg-purple-100 text-purple-800',
};

export default function ProductCard({ product, onTrack, onUntrack, tracked }: Props) {
  const [imgError, setImgError] = useState(false);
  const badge = PLATFORM_STYLE[product.platform] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-2"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-5xl">🚗</span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
            {product.name}
          </h3>
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
            {product.platform}
          </span>
        </div>

        {product.weight && (
          <p className="text-xs text-gray-500 mb-2">{product.weight}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">₹{product.price}</p>

          {tracked && onUntrack && product.id != null ? (
            <button
              onClick={() => onUntrack(product.id!)}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Untrack
            </button>
          ) : (
            onTrack && (
              <button
                onClick={() => onTrack(product)}
                className="text-xs px-3 py-1.5 rounded-lg bg-yellow-400 font-semibold text-gray-900 hover:bg-yellow-300 transition-colors"
              >
                Track
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
