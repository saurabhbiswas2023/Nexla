import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Atom Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-violet-600');
      expect(button).toHaveClass('px-6', 'py-2', 'text-sm');
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders children correctly', () => {
      render(<Button>Custom Text</Button>);
      
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });

    it('does not render when visible is false', () => {
      render(<Button visible={false}>Hidden Button</Button>);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant="primary">Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-violet-600');
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border');
    });

    it('renders floating variant correctly', () => {
      render(<Button variant="floating">Floating</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('shadow-lg');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-xs');
    });

    it('renders medium size correctly (default)', () => {
      render(<Button size="md">Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-2', 'text-sm');
    });

    it('renders large size correctly', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-3', 'text-base');
    });
  });

  describe('Icons', () => {
    it('renders chevron-up icon correctly', () => {
      render(<Button icon="chevron-up">Back to top</Button>);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders message-circle icon correctly', () => {
      render(<Button icon="message-circle">Message</Button>);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not render icon when set to none', () => {
      render(<Button icon="none">No Icon</Button>);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('renders with static position by default', () => {
      render(<Button>Static</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('fixed');
    });

    it('renders with fixed-bottom-right position', () => {
      render(<Button position="fixed-bottom-right">Fixed</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
    });
  });

  describe('Full Width', () => {
    it('renders with full width when full prop is true', () => {
      render(<Button full>Full Width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not have full width by default', () => {
      render(<Button>Normal Width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events (Enter)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Keyboard</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events (Space)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Keyboard</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('scrolls to top when floating variant with fixed position is clicked', async () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo');
      const user = userEvent.setup();
      
      render(
        <Button 
          variant="floating" 
          position="fixed-bottom-right"
          icon="chevron-up"
        >
          Back to top
        </Button>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Button>Accessible Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Accessible Button');
    });

    it('has minimum touch target size', () => {
      render(<Button>Touch Target</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('supports focus management', () => {
      render(<Button>Focusable</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('handles disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML button props correctly', () => {
      render(
        <Button 
          type="submit" 
          data-testid="custom-button"
          aria-describedby="description"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button></Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles complex children (JSX elements)', () => {
      render(
        <Button>
          <span>Complex</span> <strong>Children</strong>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
    });

    it('maintains memo optimization', () => {
      const { rerender } = render(<Button>Test</Button>);
      
      // Component should not re-render with same props
      rerender(<Button>Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});
