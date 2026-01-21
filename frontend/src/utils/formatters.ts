import { format, parseISO } from 'date-fns';

/**
 * Format price to PLN currency
 */
export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} PLN`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd.MM.yyyy');
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd.MM.yyyy HH:mm');
};

/**
 * Format time to readable string
 */
export const formatTime = (time: string): string => {
  return time.slice(0, 5); // HH:MM from HH:MM:SS
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +48 XXX XXX XXX
  if (cleaned.length === 11 && cleaned.startsWith('48')) {
    return `+48 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Format status to display text
 */
export const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};
