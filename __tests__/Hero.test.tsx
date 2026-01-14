import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from '../app/components/Hero';

describe('Hero', () => {
  it('afișează titlul principal', () => {
    render(<Hero />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
