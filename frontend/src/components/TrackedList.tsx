import { type Product } from '../utils/api';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  onUntrack: (id: number) => void;
}

export default function TrackedList({ products, onUntrack }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">No products tracked yet. Search and click <strong>Track</strong> on any product.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          onUntrack={onUntrack}
          tracked
        />
      ))}
    </div>
  );
}
