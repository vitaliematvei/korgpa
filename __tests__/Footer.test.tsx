import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../app/components/Footer';

describe('Footer', () => {
  it('conține textul de copyright', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(
        (content) =>
          typeof content === 'string' &&
          content.includes(
            `© ${year} KORG PA Set-uri PRO. Toate drepturile rezervate.`
          )
      )
    ).toBeInTheDocument();
  });
});
