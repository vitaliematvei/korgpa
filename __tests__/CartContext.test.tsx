import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider } from '../app/context/CartContext';
import { ReactNode } from 'react';

describe('CartContext', () => {
  it('poate fi folosit fără erori', () => {
    render(
      <CartProvider>
        <div>Test</div>
      </CartProvider>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
