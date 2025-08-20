// src/services/bluetooth.ts
// Serviço central de Bluetooth para o Blink (TS)
// Compatível com a lib `react-native-bluetooth-classic`

import { Platform } from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";

export type DeviceId = string;

export type BTDevice = {
  id: string;
  address?: string;
  name?: string;
  bonded?: boolean;
  connected?: boolean;
  isConnected?: () => Promise<boolean>;
  disconnect?: () => Promise<void>;
  [key: string]: any;
};

export type ConnectOptions = {
  delimiter?: string;
  encoding?: "ascii" | "utf8";
  deviceIdIsMac?: boolean;
};

export type Subscription = { remove: () => void };

const DEFAULTS: Required<Pick<ConnectOptions, "delimiter">> = {
  delimiter: "\n",
};

let currentDevice: any | null = null;

/** Verifica se o BT está disponível e habilitado */
export async function ensureEnabled(): Promise<boolean> {
  const available =
    (await safeCall(() => RNBluetoothClassic.isBluetoothAvailable?.())) ?? true;
  const enabled =
    (await safeCall(() => RNBluetoothClassic.isBluetoothEnabled?.())) ?? false;

  if (!available) return false;
  if (enabled) return true;

  const requested = await safeCall(() =>
    RNBluetoothClassic.requestBluetoothEnabled?.()
  );
  return !!requested;
}

/** Lista dispositivos já pareados */
export async function listPaired(): Promise<BTDevice[]> {
  const bonded =
    (await safeCall(() => RNBluetoothClassic.getBondedDevices?.())) ?? [];
  return normalizeDevices(bonded);
}

/** Descobre dispositivos próximos */
export async function discover(timeoutMs = 10000): Promise<BTDevice[]> {
  await safeCall(() => RNBluetoothClassic.cancelDiscovery?.());
  const discovered =
    (await safeCall(() => RNBluetoothClassic.startDiscovery?.())) ?? [];

  setTimeout(() => {
    safeCall(() => RNBluetoothClassic.cancelDiscovery?.());
  }, timeoutMs);

  return normalizeDevices(discovered);
}

/** Conecta ao dispositivo pelo id */
export async function connect(
  deviceId: DeviceId,
  opts: ConnectOptions = {}
): Promise<BTDevice> {
  const options = { ...DEFAULTS, ...opts };

  // Delay antes de conectar para evitar race conditions
  await new Promise((res) => setTimeout(res, 500));

  currentDevice = await requireConnected(() =>
    RNBluetoothClassic.connectToDevice?.(deviceId, {
      delimiter: options.delimiter,
    })
  );

  try {
    if (options.encoding && currentDevice?.setEncoding) {
      await currentDevice.setEncoding(options.encoding);
    }
  } catch {
    // silencioso
  }

  return normalizeDevice(currentDevice);
}

/** Desconecta do dispositivo atual */
export async function disconnect(): Promise<void> {
  if (!currentDevice) return;
  try {
    if (currentDevice.disconnect) {
      await currentDevice.disconnect();
    } else {
      currentDevice.connected = false;
    }
  } catch (e) {
    console.warn("[bluetooth] erro ao desconectar:", e);
  } finally {
    currentDevice = null;
  }
}

/** Envia mensagem para o dispositivo conectado */
export async function send(message: string, appendDelimiter = true): Promise<void> {
  if (!currentDevice) throw new Error("Nenhum dispositivo conectado.");
  const payload = appendDelimiter ? message + DEFAULTS.delimiter : message;
  await safeCall(() => currentDevice.write?.(payload));
}

/** Assina recebimento de dados por linhas */
export function subscribeLines(onLine: (line: string) => void): Subscription {
  if (!currentDevice) throw new Error("Nenhum dispositivo conectado.");

  const handler = (event: { data?: string } | string) => {
    const raw = typeof event === "string" ? event : event?.data ?? "";
    if (!raw) return;
    raw.split(DEFAULTS.delimiter).forEach((line) => {
      if (line.trim().length) onLine(line);
    });
  };

  if (currentDevice?.onDataReceived) {
    const sub: Subscription = currentDevice.onDataReceived(handler);
    return sub ?? { remove: () => {} };
  }

  if ((RNBluetoothClassic as any)?.onDataReceived) {
    const sub: Subscription = (RNBluetoothClassic as any).onDataReceived(handler);
    return sub ?? { remove: () => {} };
  }

  console.warn(
    "[bluetooth] Nenhuma API de assinatura encontrada. Atualize a lib ou ajuste o subscribeLines."
  );
  return { remove: () => {} };
}

/** Retorna o dispositivo atualmente conectado */
export function getCurrentDevice(): BTDevice | null {
  return currentDevice ? normalizeDevice(currentDevice) : null;
}

/* =========================
 * Helpers
 * =======================*/

function normalizeDevices(list: any[]): BTDevice[] {
  return (list ?? []).map(normalizeDevice);
}

function normalizeDevice(d: any): BTDevice {
  if (!d) return d;
  const id = d.id ?? d.address ?? d.deviceId ?? d.uuid ?? d.macAddress;

  return {
    id,
    address: d.address ?? d.id ?? id,
    name: d.name ?? d.deviceName ?? d.title ?? "Dispositivo",
    bonded: d.bonded ?? d.paired ?? d.isBonded ?? false,
    connected: d.connected ?? d.isConnected ?? false,

    // Funções seguras
    isConnected: d.isConnected
      ? d.isConnected.bind(d)
      : async () => !!d.connected,
    disconnect: d.disconnect
      ? d.disconnect.bind(d)
      : async () => { d.connected = false; },

    ...d,
  };
}

async function safeCall<T>(fn: (() => Promise<T>) | undefined): Promise<T | undefined> {
  try {
    if (!fn) return undefined;
    return await fn();
  } catch (e) {
    console.warn("[bluetooth] erro:", e);
    return undefined;
  }
}

async function requireConnected<T>(fn: (() => Promise<T>) | undefined): Promise<T> {
  if (!fn) throw new Error("API de conexão indisponível na versão da lib.");
  try {
    return await fn();
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    throw new Error("Falha ao conectar: " + msg);
  }
}
