const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfLocalDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const isSameLocalDay = (
  left: string | Date,
  right: string | Date,
) => {
  const a = left instanceof Date ? left : new Date(left);
  const b = right instanceof Date ? right : new Date(right);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const dayDiffFromToday = (value: Date, now: Date) => {
  const start = startOfLocalDay(value).getTime();
  const today = startOfLocalDay(now).getTime();
  return Math.round((today - start) / MS_PER_DAY);
};

export const formatChatDayLabel = (
  value: string | Date,
  now: Date = new Date(),
) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffDays = dayDiffFromToday(date, now);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatConversationTime = (
  value?: string | null,
  now: Date = new Date(),
) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffDays = dayDiffFromToday(date, now);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { timeStyle: 'short' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatMessageTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { timeStyle: 'short' });
};
