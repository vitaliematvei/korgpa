import { useEffect, useState } from 'react';
import { useClient } from 'sanity';

type ProductListItem = {
  _id: string;
  name?: string;
  slug?: string;
  price?: number;
  _updatedAt: string;
};

export default function ProductListPane() {
  const client = useClient({ apiVersion: '2025-12-09' });
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    client
      .fetch<ProductListItem[]>(
        `*[_type == "product"] | order(_updatedAt desc) {
          _id,
          name,
          "slug": slug.current,
          price,
          _updatedAt
        }`,
      )
      .then((result) => {
        if (!cancelled) {
          setProducts(result);
          setError(null);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Could not load products.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  if (loading) {
    return <div style={styles.message}>Loading products...</div>;
  }

  if (error) {
    return <div style={styles.message}>Error loading products: {error}</div>;
  }

  if (products.length === 0) {
    return <div style={styles.message}>No products found.</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Products</h2>
        <span style={styles.count}>{products.length} items</span>
      </div>
      <div style={styles.list}>
        {products.map((product) => (
          <a
            key={product._id}
            href={`/studio/intent/edit/id=${encodeURIComponent(product._id)};type=product`}
            style={styles.item}
          >
            <div style={styles.itemTopRow}>
              <strong style={styles.name}>
                {product.name || 'Untitled product'}
              </strong>
              <span style={styles.price}>
                {typeof product.price === 'number'
                  ? `EUR ${product.price.toFixed(2)}`
                  : 'No price'}
              </span>
            </div>
            <div style={styles.meta}>
              <span>{product.slug ? `/${product.slug}` : 'No slug'}</span>
              <span>{new Date(product._updatedAt).toLocaleString()}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    height: '100%',
    overflow: 'auto',
    background: '#f6f6f8',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
  },
  count: {
    fontSize: '14px',
    color: '#6b7280',
  },
  list: {
    display: 'grid',
    gap: '12px',
  },
  item: {
    display: 'block',
    padding: '16px',
    borderRadius: '10px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    textDecoration: 'none',
    color: '#111827',
  },
  itemTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px',
  },
  name: {
    fontSize: '16px',
  },
  price: {
    fontSize: '13px',
    color: '#2563eb',
    whiteSpace: 'nowrap',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '12px',
    color: '#6b7280',
  },
  message: {
    padding: '24px',
    fontSize: '14px',
  },
};
