export const APP_CONFIG = {
  apiBaseUrl: 'http://localhost:8080',
  /** Path on the API host for the native WebSocket (Spring WebFlux). */
  vmWebSocketPath: '/ws/vms',
  appName: 'VM Console',
} as const;

/**
 * Builds `ws://` / `wss://` URL from the HTTP API base so dev/prod stay aligned (same host, TLS when API is https).
 */
export function resolveVmWebSocketUrl(apiBaseUrl: string = APP_CONFIG.apiBaseUrl): string {
  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = APP_CONFIG.vmWebSocketPath;
  url.search = '';
  url.hash = '';
  return url.toString();
}
