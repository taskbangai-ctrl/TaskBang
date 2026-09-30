/**
 * Custom Sequential Padded ID Generator for TaskBang
 * Formats: TB-W-000001, TB-C-000001, TB-T-000001, etc.
 */

export const formatCustomId = (prefix, number) => {
  const paddedNumber = String(number).padStart(6, '0');
  return `TB-${prefix}-${paddedNumber}`;
};

// Frontend Fallback/Helper (if Sequence number provided)
export const generateCustomId = (type, seqNumber = 1) => {
  const paddedNumber = String(seqNumber).padStart(6, '0');

  switch (type?.toUpperCase()) {
    case 'WORKER':
      return `TB-W-${paddedNumber}`;
    case 'CLIENT':
      return `TB-C-${paddedNumber}`;
    case 'TASK':
      return `TB-T-${paddedNumber}`;
    case 'SUBMISSION':
      return `TB-S-${paddedNumber}`;
    case 'PAYMENT':
      return `TB-P-${paddedNumber}`;
    case 'WITHDRAWAL':
      return `TB-WD-${paddedNumber}`;
    default:
      return `TB-X-${paddedNumber}`;
  }
};