import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import { Label } from './Label';

describe('Label Atom Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Label>Test Label</Label>);
      
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveClass('block', 'font-medium');
      expect(label).toHaveClass('text-sm', 'text-slate-600');
    });

    it('renders with custom className', () => {
      render(<Label className="custom-label">Custom Label</Label>);
      
      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass('custom-label');
    });

    it('renders children correctly', () => {
      render(<Label>Label Text</Label>);
      
      expect(screen.getByText('Label Text')).toBeInTheDocument();
    });

    it('renders complex children (JSX elements)', () => {
      render(
        <Label>
          <span>Complex</span> <strong>Label</strong>
        </Label>
      );

      const label = screen.getByText('Complex').closest('label');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toMatch(/Complex/);
      expect(label?.textContent).toMatch(/Label/);
    });
  });

  describe('Required Indicator', () => {
    it('shows required asterisk when required is true', () => {
      render(<Label required>Required Field</Label>);
      
      const label = screen.getByText('Required Field');
      expect(label).toBeInTheDocument();
      
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-500', 'ml-1');
      expect(asterisk).toHaveAttribute('aria-label', 'required');
    });

    it('does not show asterisk when required is false (default)', () => {
      render(<Label>Optional Field</Label>);
      
      const label = screen.getByText('Optional Field');
      expect(label).toBeInTheDocument();
      
      const asterisk = screen.queryByText('*');
      expect(asterisk).not.toBeInTheDocument();
    });

    it('does not show asterisk when explicitly set to false', () => {
      render(<Label required={false}>Not Required</Label>);
      
      const label = screen.getByText('Not Required');
      expect(label).toBeInTheDocument();
      
      const asterisk = screen.queryByText('*');
      expect(asterisk).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Label size="sm">Small Label</Label>);
      
      const label = screen.getByText('Small Label');
      expect(label).toHaveClass('text-xs');
    });

    it('renders medium size correctly (default)', () => {
      render(<Label size="md">Medium Label</Label>);
      
      const label = screen.getByText('Medium Label');
      expect(label).toHaveClass('text-sm');
    });

    it('renders large size correctly', () => {
      render(<Label size="lg">Large Label</Label>);
      
      const label = screen.getByText('Large Label');
      expect(label).toHaveClass('text-base');
    });
  });

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<Label variant="default">Default Label</Label>);
      
      const label = screen.getByText('Default Label');
      expect(label).toHaveClass('text-slate-600');
    });

    it('renders error variant correctly', () => {
      render(<Label variant="error">Error Label</Label>);
      
      const label = screen.getByText('Error Label');
      expect(label).toHaveClass('text-red-600');
    });

    it('renders success variant correctly', () => {
      render(<Label variant="success">Success Label</Label>);
      
      const label = screen.getByText('Success Label');
      expect(label).toHaveClass('text-green-600');
    });
  });

  describe('Form Association', () => {
    it('associates with form control using htmlFor', () => {
      render(<Label htmlFor="test-input">Associated Label</Label>);
      
      const label = screen.getByText('Associated Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('works with input elements', () => {
      render(
        <div>
          <Label htmlFor="email-input">Email Address</Label>
          <input id="email-input" type="email" />
        </div>
      );
      
      const label = screen.getByText('Email Address');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic label structure', () => {
      render(<Label>Accessible Label</Label>);
      
      const label = screen.getByText('Accessible Label');
      expect(label.tagName).toBe('LABEL');
    });

    it('provides proper ARIA attributes for required fields', () => {
      render(<Label required>Required Field</Label>);
      
      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveAttribute('aria-label', 'required');
    });

    it('supports additional ARIA attributes', () => {
      render(
        <Label 
          aria-describedby="help-text"
          aria-labelledby="section-title"
        >
          Enhanced Label
        </Label>
      );
      
      const label = screen.getByText('Enhanced Label');
      expect(label).toHaveAttribute('aria-describedby', 'help-text');
      expect(label).toHaveAttribute('aria-labelledby', 'section-title');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML label props correctly', () => {
      render(
        <Label 
          id="custom-label"
          data-testid="test-label"
          title="Tooltip text"
        >
          Custom Label
        </Label>
      );
      
      const label = screen.getByText('Custom Label');
      expect(label).toHaveAttribute('id', 'custom-label');
      expect(label).toHaveAttribute('data-testid', 'test-label');
      expect(label).toHaveAttribute('title', 'Tooltip text');
    });

    it('handles event handlers correctly', () => {
      const handleClick = vi.fn();
      
      render(<Label onClick={handleClick}>Clickable Label</Label>);
      
      const label = screen.getByText('Clickable Label');
      label.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Combination Scenarios', () => {
    it('renders with all props combined', () => {
      render(
        <Label 
          size="lg"
          variant="error"
          required
          className="custom-class"
          htmlFor="complex-input"
        >
          Complex Label
        </Label>
      );
      
      const label = screen.getByText('Complex Label');
      expect(label).toHaveClass('text-base'); // size lg
      expect(label).toHaveClass('text-red-600'); // error variant
      expect(label).toHaveClass('custom-class'); // custom class
      expect(label).toHaveAttribute('for', 'complex-input'); // htmlFor
      
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument(); // required
    });

    it('handles size and variant combinations correctly', () => {
      const { rerender } = render(
        <Label size="sm" variant="success">Test</Label>
      );
      
      let label = screen.getByText('Test');
      expect(label).toHaveClass('text-xs', 'text-green-600');
      
      rerender(<Label size="lg" variant="error">Test</Label>);
      label = screen.getByText('Test');
      expect(label).toHaveClass('text-base', 'text-red-600');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Label>{''}</Label>);
      
      const label = document.querySelector('label');
      expect(label).toBeInTheDocument();
    });

    it('handles whitespace-only children', () => {
      render(<Label>   </Label>);
      
      const label = document.querySelector('label');
      expect(label).toBeInTheDocument();
    });

    it('handles numeric children', () => {
      render(<Label>{123}</Label>);
      
      const label = screen.getByText('123');
      expect(label).toBeInTheDocument();
    });

    it('handles boolean children (should not render)', () => {
      render(<Label>{true}</Label>);
      
      const label = document.querySelector('label');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toBe('');
    });
  });

  describe('Style Composition', () => {
    it('composes classes correctly without conflicts', () => {
      render(
        <Label 
          size="lg" 
          variant="error" 
          className="additional-class"
        >
          Styled Label
        </Label>
      );
      
      const label = screen.getByText('Styled Label');
      const classes = label.className.split(' ');
      
      // Should contain all expected classes
      expect(classes).toContain('block');
      expect(classes).toContain('font-medium');
      expect(classes).toContain('text-base'); // size lg
      expect(classes).toContain('text-red-600'); // error variant
      expect(classes).toContain('additional-class');
    });
  });
});
