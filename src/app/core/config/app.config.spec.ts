import { APP_CONFIG, resolveVmWebSocketUrl } from './app.config';

describe('app.config', () => {
  it('exposes stable API defaults', () => {
    expect(APP_CONFIG.apiBaseUrl).toContain('localhost');
    expect(APP_CONFIG.vmWebSocketPath).toBe('/ws/vms');
    expect(APP_CONFIG.appName).toBeTruthy();
  });

  it('resolveVmWebSocketUrl maps http to ws and https to wss', () => {
    expect(resolveVmWebSocketUrl('http://api.example.com:8080/api')).toMatch(/^ws:\/\//);
    expect(resolveVmWebSocketUrl('https://api.example.com')).toMatch(/^wss:\/\//);
    expect(resolveVmWebSocketUrl('https://api.example.com')).toContain('/ws/vms');
  });
});
