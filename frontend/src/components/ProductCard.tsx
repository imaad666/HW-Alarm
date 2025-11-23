interface Product {
  name: string;
  price: number;
  image?: string;
  weight?: string;
  platform: string;
  url?: string;
}

interface ProductCardProps {
  product: Product;
  onTrack?: (product: Product) => void;
}

export default function ProductCard({ product, onTrack }: ProductCardProps) {
  const platformColors: Record<string, string> = {
    blinkit: 'bg-green-100 text-green-800',
    zepto: 'bg-purple-100 text-purple-800',
    swiggy: 'bg-orange-100 text-orange-800',
  };

  const platformColor = platformColors[product.platform] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {product.image && (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1">{product.name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ml-2 ${platformColor}`}>
            {product.platform}
          </span>
        </div>
        {product.weight && (
          <p className="text-sm text-gray-600 mb-2">{product.weight}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
          {onTrack && (
            <button
              onClick={() => onTrack(product)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

