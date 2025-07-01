// Server configuration utilities
// This ensures consistent URL generation across server and client

export function getServerUrl(): string {
  const host = process.env.NEXT_PUBLIC_SERVER_HOST || 'localhost';
  const port = process.env.NEXT_PUBLIC_SERVER_PORT || '3000';
  
  // If host is 'auto', we'll handle this in the component with useEffect to avoid hydration issues
  if (host === 'auto') {
    return 'http://localhost:3000'; // fallback for SSR
  }
  
  return `http://${host}:${port}`;
}

export function getFirmwareUrl(): string {
  return `${getServerUrl()}/api/firmware/latest.bin`;
}

export function getServerConfig() {
  return {
    host: process.env.NEXT_PUBLIC_SERVER_HOST || 'localhost',
    port: process.env.NEXT_PUBLIC_SERVER_PORT || '3000',
    maxUploadSize: process.env.MAX_UPLOAD_SIZE || '52428800',
    isAutoDetect: (process.env.NEXT_PUBLIC_SERVER_HOST || 'localhost') === 'auto'
  };
} 
