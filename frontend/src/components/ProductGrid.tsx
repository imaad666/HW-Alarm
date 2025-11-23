import ProductCard from './ProductCard';

interface Product {
  name: string;
  price: number;
  image?: string;
  weight?: string;
  platform: string;
  url?: string;
}

interface ProductGridProps {
  products: Product[];
  onTrack?: (product: Product) => void;
  platform?: string;
}

export default function ProductGrid({ products, onTrack, platform }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  const platformTitle = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'All';

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{platformTitle} Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={`${product.platform}-${index}`} product={product} onTrack={onTrack} />
        ))}
      </div>
    </div>
  );
}

