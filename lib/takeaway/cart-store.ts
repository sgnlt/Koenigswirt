import { useSyncExternalStore } from "react";
import { MAX_QUANTITY_PER_LINE } from "./types";

export type CartEntry = { key: string; quantity: number };

const STORAGE_KEY = "koenigswirt.cart.v1";
const EMPTY: CartEntry[] = [];

let cart: CartEntry[] | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartEntry[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    return value.filter(
      (entry): entry is CartEntry =>
        typeof entry?.key === "string" && Number.isInteger(entry?.quantity) && entry.quantity > 0,
    );
  } catch {
    return EMPTY;
  }
}

function read() {
  if (cart === null) {
    try {
      cart = parse(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      cart = EMPTY;
    }
  }
  return cart;
}

function write(next: CartEntry[]) {
  cart = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the cart still works until the page is reloaded.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cart = parse(event.newValue);
    listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(key: string) {
  const current = read();
  const existing = current.find((entry) => entry.key === key);
  setQuantity(key, Math.min((existing?.quantity ?? 0) + 1, MAX_QUANTITY_PER_LINE));
}

export function setQuantity(key: string, quantity: number) {
  const current = read();
  if (quantity <= 0) return write(current.filter((entry) => entry.key !== key));
  if (current.some((entry) => entry.key === key)) {
    return write(current.map((entry) => (entry.key === key ? { key, quantity } : entry)));
  }
  write([...current, { key, quantity }]);
}

export function clearCart() {
  write(EMPTY);
}
