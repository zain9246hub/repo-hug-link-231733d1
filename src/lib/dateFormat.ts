/**
 * Format a date string to "16 Apr 2026, 8:30 PM" format
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('en-IN', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day} ${month} ${year}, ${time}`;
};

/**
 * Format date for chat messages - shows time for today, date+time otherwise
 */
export const formatChatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return formatDateTime(dateStr);
};
