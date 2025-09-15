import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { expect } from 'vitest';

// Mock theme context for testing
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-theme="light">
      {children}
    </div>
  );
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const future = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  } as const;
  return (
    <BrowserRouter future={future}>
      <MockThemeProvider>
        {children}
      </MockThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Custom matchers for better assertions
export const expectToHaveClasses = (element: HTMLElement, classes: string[]) => {
  classes.forEach(className => {
    expect(element).toHaveClass(className);
  });
};

export const expectToBeAccessible = (element: HTMLElement) => {
  // Check for basic accessibility attributes
  if (element.tagName === 'BUTTON') {
    expect(element).toHaveAttribute('type');
  }
  
  if (element.getAttribute('role') === 'button') {
    expect(element).toHaveAttribute('tabIndex');
  }
  
  // Check for ARIA labels
  const hasAriaLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby') ||
                      element.textContent;
  expect(hasAriaLabel).toBeTruthy();
};

// Mock data for testing
export const mockConnectors = [
  'Shopify',
  'BigQuery', 
  'Google BigQuery',
  'Salesforce',
  'Mailchimp',
  'PostgreSQL',
  'Stripe',
  'Google Sheets',
  'Webhook',
  'Snowflake'
];

export const mockStatuses = ['pending', 'partial', 'complete', 'error'] as const;
