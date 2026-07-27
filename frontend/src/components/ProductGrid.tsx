import { type Product } from '../utils/api';
import ProductCard from './ProductCard';

interface Props {
  title: string;
  products: Product[];
  onTrack: (product: Product) => void;
}

export default function ProductGrid({ title, products, onTrack }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        {title}
        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {products.length} result{products.length !== 1 ? 's' : ''}
        </span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((p, i) => (
          <ProductCard
            key={`${p.platform}-${i}`}
            product={p}
            onTrack={onTrack}
          />
        ))}
      </div>
    </section>
  );
}
