import { ReactNode, forwardRef } from 'react';
import { Input, InputProps } from '../atoms/Input';
import { Label, LabelProps } from '../atoms/Label';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  labelProps?: Omit<LabelProps, 'htmlFor' | 'children'>;
  children?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, id, error, helpText, labelProps = {}, children, className = '', ...inputProps },
    ref
  ) => {
    const variant = error ? 'error' : inputProps.variant || 'default';

    return (
      <div className={`space-y-1 ${className}`}>
        <Label htmlFor={id} variant={variant} {...labelProps}>
          {label}
        </Label>

        {children || (
          <Input
            ref={ref}
            id={id}
            variant={variant}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            aria-invalid={!!error}
            {...inputProps}
          />
        )}

        {error && (
          <div id={`${id}-error`} className="text-xs text-red-600" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {helpText && !error && (
          <div id={`${id}-help`} className="text-xs text-slate-500">
            {helpText}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
