import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders a button with the given text', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies the correct variant class', () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole('button', { name: /delete/i });
    expect(buttonElement).toHaveClass('bg-destructive');
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Cannot click</Button>);
    const buttonElement = screen.getByRole('button', { name: /cannot click/i });
    expect(buttonElement).toBeDisabled();
  });
});
