import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../app/components/Header';
import { CartProvider } from '../app/context/CartContext';

describe('Header', () => {
  it('afișează logo-ul și linkurile de navigare', () => {
    render(
      <CartProvider>
        <Header />
      </CartProvider>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // Verifică logo-ul după aria-label
    expect(
      screen.getByLabelText('Go to KORG PA Sets Pro homepage')
    ).toBeInTheDocument();
    // Verifică existența linkurilor de navigare principale
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Set-uri KORG PA').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0);
  });
});
