import React, { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input Atom Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('border-slate-300');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('renders with custom className', () => {
      render(<Input className="custom-input" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text here" />);
      
      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Input defaultValue="Default text" />);
      
      const input = screen.getByDisplayValue('Default text');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<Input variant="default" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-slate-300');
      expect(input).toHaveClass('focus:border-blue-500');
    });

    it('renders error variant correctly', () => {
      render(<Input variant="error" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-ultra-light');
      expect(input).toHaveClass('focus:border-red-500');
    });

    it('renders success variant correctly', () => {
      render(<Input variant="success" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-300');
      expect(input).toHaveClass('focus:border-green-500');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Input size="sm" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-2', 'py-1', 'text-xs');
      expect(input).toHaveClass('min-h-[32px]');
    });

    it('renders medium size correctly (default)', () => {
      render(<Input size="md" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');
      expect(input).toHaveClass('min-h-[44px]');
    });

    it('renders large size correctly', () => {
      render(<Input size="lg" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4', 'py-3', 'text-base');
      expect(input).toHaveClass('min-h-[48px]');
    });
  });

  describe('Full Width', () => {
    it('renders with full width when fullWidth prop is true', () => {
      render(<Input fullWidth />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
    });

    it('does not have full width by default', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('w-full');
    });
  });

  describe('Input Types', () => {
    it('renders as text input by default', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      // HTML type defaults to "text" for input unless otherwise specified.
      // In JSDOM, getAttribute('type') may be null if not explicitly set, so check property instead.
      expect((input as HTMLInputElement).type).toBe('text');
    });

    it('renders as email input', () => {
      render(<Input type="email" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders as password input', () => {
      render(<Input type="password" />);

      const el = document.querySelector('input[type="password"]') as HTMLInputElement;
      expect(el).toBeInTheDocument();
      expect(el.type).toBe('password');
    });

    it('renders as number input', () => {
      render(<Input type="number" />);
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Interactions', () => {
    it('handles onChange events', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test input');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test input');
    });

    it('handles onFocus events', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onBlur events', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Move focus away
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
      const handleKeyDown = vi.fn();
      
      render(<Input onKeyDown={handleKeyDown} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none', 'focus:ring-1');
    });

    it('supports ARIA attributes', () => {
      render(
        <Input 
          aria-label="Search input"
          aria-describedby="search-help"
          aria-required="true"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search input');
      expect(input).toHaveAttribute('aria-describedby', 'search-help');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('has minimum touch target size for medium and large sizes', () => {
      const { rerender } = render(<Input size="md" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveClass('min-h-[44px]');
      
      rerender(<Input size="lg" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('min-h-[48px]');
    });

    it('handles disabled state correctly', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('handles readonly state correctly', () => {
      render(<Input readOnly value="Read only text" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('Read only text');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const inputRef = createRef<HTMLInputElement>();
      
      render(<Input ref={inputRef} />);
      
      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
      expect(inputRef.current).toBe(screen.getByRole('textbox'));
    });

    it('allows imperative focus through ref', () => {
      const inputRef = createRef<HTMLInputElement>();
      
      render(<Input ref={inputRef} />);
      
      inputRef.current?.focus();
      expect(inputRef.current).toHaveFocus();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML input props correctly', () => {
      render(
        <Input 
          name="test-input"
          id="test-id"
          data-testid="custom-input"
          maxLength={10}
          minLength={2}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'test-input');
      expect(input).toHaveAttribute('id', 'test-id');
      expect(input).toHaveAttribute('data-testid', 'custom-input');
      expect(input).toHaveAttribute('maxlength', '10');
      expect(input).toHaveAttribute('minlength', '2');
    });

    it('excludes size prop from HTML attributes', () => {
      render(<Input size="lg" />);
      
      const input = screen.getByRole('textbox');
      // HTML size attribute should not be present
      expect(input).not.toHaveAttribute('size');
    });
  });

  describe('Form Integration', () => {
    it('works with controlled components', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };
      
      const user = userEvent.setup();
      render(<TestComponent />);
      
      const input = screen.getByTestId('controlled-input');
      await user.type(input, 'controlled');
      
      expect(input).toHaveValue('controlled');
    });

    it('works with uncontrolled components', async () => {
      const user = userEvent.setup();
      
      render(<Input defaultValue="uncontrolled" />);
      
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'new value');
      
      expect(input).toHaveValue('new value');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string values', () => {
      render(<Input value="" readOnly />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('handles null and undefined values gracefully', () => {
      render(<Input value={undefined} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('maintains component display name', () => {
      expect(Input.displayName).toBe('Input');
    });
  });
});
