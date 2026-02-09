// API utility functions
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || '';
};