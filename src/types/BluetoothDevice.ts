export type BluetoothDevice = {
  name?: string;
  address?: string;
  id?: string;
  isConnected: () => Promise<boolean>;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  write: (data: string) => Promise<void>;
  onDataReceived: (callback: (event: { data: string }) => void) => void;
};
