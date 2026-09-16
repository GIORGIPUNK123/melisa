export const sameId = (
  a?: string | number | null,
  b?: string | number | null,
) => {
  if (a == null || b == null) return false;
  return String(a) === String(b);
};

export const asId = (value: string | number) => String(value);
