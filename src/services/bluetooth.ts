// src/services/bluetooth.ts
// Serviço central de Bluetooth para o Blink (TS)
// Compatível com a lib `react-native-bluetooth-classic`

import { Platform } from "react-native";
// A tipagem oficial varia por versão; usamos `any` em alguns pontos para manter compatibilidade.
import RNBluetoothClassic from "react-native-bluetooth-classic";

export type DeviceId = string;

export type BTDevice = {
  id: string;          // Android: MAC; iOS: UUID
  address?: string;    // alias de id em algumas versões
  name?: string;
  bonded?: boolean;
  connected?: boolean;
  // Campos extras podem existir conforme a versão da lib
  [key: string]: any;
};

export type ConnectOptions = {
  delimiter?: string;          // como '\n' para mensagens por linha
  encoding?: "ascii" | "utf8"; // depende da versão
  deviceIdIsMac?: boolean;     // (Android) se quiser forçar MAC
};

export type Subscription = { remove: () => void };

const DEFAULTS: Required<Pick<ConnectOptions, "delimiter">> = {
  delimiter: "\n",
};

// Guardamos o device conectado atual para facilitar chamadas
let currentDevice: any | null = null;

/** Verifica se o BT está disponível e habilitado; tenta habilitar se precisar. */
export async function ensureEnabled(): Promise<boolean> {
  const available =
    (await safeCall(() => RNBluetoothClassic.isBluetoothAvailable?.())) ?? true;
  const enabled =
    (await safeCall(() => RNBluetoothClassic.isBluetoothEnabled?.())) ?? false;

  if (!available) return false;
  if (enabled) return true;

  // Tenta habilitar (Android). No iOS, geralmente já vem habilitado pelo SO.
  const requested = await safeCall(() =>
    RNBluetoothClassic.requestBluetoothEnabled?.()
  );
  return !!requested;
}

/** Lista dispositivos já pareados (bonded). */
export async function listPaired(): Promise<BTDevice[]> {
  const bonded =
    (await safeCall(() => RNBluetoothClassic.getBondedDevices?.())) ?? [];
  return normalizeDevices(bonded);
}

/** Descobre dispositivos próximos (descoberta ativa). */
export async function discover(timeoutMs = 10000): Promise<BTDevice[]> {
  // Cancela uma descoberta anterior, se existir
  await safeCall(() => RNBluetoothClassic.cancelDiscovery?.());
  const discovered =
    (await safeCall(() => RNBluetoothClassic.startDiscovery?.())) ?? [];
  // Por garantia, cancela após timeout (Android)
  setTimeout(() => {
    safeCall(() => RNBluetoothClassic.cancelDiscovery?.());
  }, timeoutMs);
  return normalizeDevices(discovered);
}

/** Conecta ao dispositivo pelo id (MAC no Android / UUID no iOS). */
export async function connect(
  deviceId: DeviceId,
  opts: ConnectOptions = {}
): Promise<BTDevice> {
  const options = { ...DEFAULTS, ...opts };

  // Algumas versões aceitam { delimiter }, setEncoding, etc.
  // A própria lib expõe connectToDevice(id, { delimiter }).
  currentDevice = await requireConnected(() =>
    RNBluetoothClassic.connectToDevice?.(deviceId, {
      delimiter: options.delimiter,
    })
  );

  // Opcional: encoding por linha, se suportado
  try {
    if (options.encoding && currentDevice?.setEncoding) {
      await currentDevice.setEncoding(options.encoding);
    }
  } catch {
    // silencioso: nem todas as versões suportam
  }

  return normalizeDevice(currentDevice);
}

/** Desconecta do dispositivo atual, se houver. */
export async function disconnect(): Promise<void> {
  if (!currentDevice) return;
  await safeCall(() => currentDevice.disconnect?.());
  currentDevice = null;
}

/** Envia uma string (acrescenta delimitador por padrão). */
export async function send(message: string, appendDelimiter = true): Promise<void> {
  if (!currentDevice) throw new Error("Nenhum dispositivo conectado.");
  const payload = appendDelimiter ? message + DEFAULTS.delimiter : message;
  await safeCall(() => currentDevice.write?.(payload));
}

/**
 * Assina recebimento de dados como linhas.
 * Retorna uma função `remove()` para cancelar a assinatura.
 */
export function subscribeLines(onLine: (line: string) => void): Subscription {
  if (!currentDevice) throw new Error("Nenhum dispositivo conectado.");

  // API mais comum da lib: `device.onDataReceived(cb)`
  // Nem todas versões têm tipagem; tratamos como any.
  const handler = (event: { data?: string } | string) => {
    const raw = typeof event === "string" ? event : event?.data ?? "";
    if (!raw) return;
    // Divide por linhas, caso chegue com múltiplas
    raw.split(DEFAULTS.delimiter).forEach((line) => {
      if (line.trim().length) onLine(line);
    });
  };

  // Preferência: listener por device conectado
  if (currentDevice?.onDataReceived) {
    const sub: Subscription = currentDevice.onDataReceived(handler);
    return sub ?? { remove: () => {} };
  }

  // Fallback: alguns builds expõem um listener no módulo
  if ((RNBluetoothClassic as any)?.onDataReceived) {
    const sub: Subscription = (RNBluetoothClassic as any).onDataReceived(handler);
    return sub ?? { remove: () => {} };
  }

  // Último recurso: usar NativeEventEmitter da lib (nome de evento pode variar).
  // Manter vazio para evitar acoplar a eventos específicos.
  console.warn(
    "[bluetooth] Nenhuma API de assinatura encontrada. Atualize a lib ou ajuste o subscribeLines."
  );
  return { remove: () => {} };
}

/** Dispositivo atualmente conectado (normalizado) ou null. */
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
