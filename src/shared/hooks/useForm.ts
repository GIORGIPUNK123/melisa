import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as yup from 'yup';

type FormErrors<T> = Partial<Record<keyof T, string>>;

export type FormSubmitHelpers<T extends object> = {
  baseline: T;
  setFieldError: (field: keyof T, message?: string) => void;
  setFormError: (message: string | null) => void;
  reset: (nextValues?: T) => void;
};

type UseFormOptions<T extends object> = {
  initialValues: T;
  schema?: yup.AnyObjectSchema;
  onSubmit: (
    values: T,
    helpers: FormSubmitHelpers<T>,
  ) => Promise<void> | void;
};

export const useForm = <T extends object>({
  initialValues,
  schema,
  onSubmit,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [baseline, setBaseline] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validatingField, setValidatingField] = useState<keyof T | null>(null);
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const isDirty = useMemo(
    () =>
      (Object.keys(values) as Array<keyof T>).some(
        (field) => !Object.is(values[field], baseline[field]),
      ),
    [values, baseline],
  );

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      const next = { ...valuesRef.current, [field]: value };
      valuesRef.current = next;
      setValues(next);
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const nextErrors = { ...prev };
        delete nextErrors[field];
        return nextErrors;
      });
      setFormError(null);
    },
    [],
  );

  const setFieldError = useCallback((field: keyof T, message?: string) => {
    setErrors((prev) => {
      if (!message) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  }, []);

  const reset = useCallback(
    (nextValues?: T) => {
      const next = nextValues ?? baseline;
      valuesRef.current = next;
      setValues(next);
      if (nextValues) setBaseline(nextValues);
      setErrors({});
      setFormError(null);
      setValidatingField(null);
    },
    [baseline],
  );

  const validateField = useCallback(
    async (field: keyof T) => {
      if (!schema) return true;

      const valueAtStart = valuesRef.current[field];
      setValidatingField(field);

      try {
        await schema.validateAt(String(field), valuesRef.current);
        if (!Object.is(valuesRef.current[field], valueAtStart)) return false;
        setFieldError(field);
        return true;
      } catch (error) {
        if (!Object.is(valuesRef.current[field], valueAtStart)) return false;
        const message =
          error instanceof yup.ValidationError
            ? error.message
            : 'Invalid value';
        setFieldError(field, message);
        return false;
      } finally {
        setValidatingField((current) => (current === field ? null : current));
      }
    },
    [schema, setFieldError],
  );

  const validateAll = useCallback(async () => {
    if (!schema) return true;

    setIsValidating(true);
    try {
      await schema.validate(valuesRef.current, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const next: FormErrors<T> = {};
        const issues = error.inner.length > 0 ? error.inner : [error];

        issues.forEach((issue) => {
          if (!issue.path) return;
          const field = issue.path.split('.').pop() as keyof T;
          if (!next[field]) next[field] = issue.message;
        });

        setErrors(next);
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [schema]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (isSubmitting || isValidating) return;

      const isValid = await validateAll();
      if (!isValid) return;

      setIsSubmitting(true);
      setFormError(null);

      try {
        await onSubmit(valuesRef.current, {
          baseline,
          setFieldError,
          setFormError,
          reset,
        });
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : 'Something went wrong',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      isValidating,
      validateAll,
      onSubmit,
      baseline,
      setFieldError,
      reset,
    ],
  );

  const field = useCallback(
    <K extends keyof T & string>(name: K) => ({
      name,
      value: values[name],
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(name, event.target.value as T[K]);
      },
      onBlur: () => {
        void validateField(name);
      },
    }),
    [values, setFieldValue, validateField],
  );

  return {
    values,
    baseline,
    errors,
    formError,
    isDirty,
    isSubmitting,
    isValidating,
    validatingField,
    isBusy: isSubmitting || isValidating,
    field,
    setFieldValue,
    setFieldError,
    setFormError,
    validateField,
    reset,
    handleSubmit,
  };
};
