import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MovieCard from './MovieCard';
import { describe, it, expect } from 'vitest';

describe('MovieCard Component', () => {
  const mockMovie = {
    id: 1,
    title: 'Inception',
    language: 'English',
    duration: 148,
    poster_url: 'https://example.com/poster.jpg'
  };

  it('renders movie title correctly', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('renders movie language and duration', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('148 min')).toBeInTheDocument();
  });

  it('contains link to movie details', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/movie/1');
  });
});
