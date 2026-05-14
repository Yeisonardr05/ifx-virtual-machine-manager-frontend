export interface OperatingSystemOption {
  value: string;
  label: string;
  icon: string;
}

export const OPERATING_SYSTEMS: ReadonlyArray<OperatingSystemOption> = [
  { value: 'Ubuntu 22.04', label: 'Ubuntu 22.04 LTS', icon: 'terminal' },
  { value: 'Ubuntu 24.04', label: 'Ubuntu 24.04 LTS', icon: 'terminal' },
  { value: 'Debian 12', label: 'Debian 12', icon: 'terminal' },
  { value: 'CentOS Stream 9', label: 'CentOS Stream 9', icon: 'terminal' },
  { value: 'Rocky Linux 9', label: 'Rocky Linux 9', icon: 'terminal' },
  { value: 'Windows Server 2022', label: 'Windows Server 2022', icon: 'desktop_windows' },
  { value: 'Windows 11', label: 'Windows 11', icon: 'desktop_windows' },
  { value: 'macOS Sonoma', label: 'macOS Sonoma', icon: 'laptop_mac' },
  { value: 'FreeBSD 14', label: 'FreeBSD 14', icon: 'memory' },
];
