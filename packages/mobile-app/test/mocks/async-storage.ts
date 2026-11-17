import { vi } from "vitest";

// Native storage is supplied by the host; package tests run without a native install.
export default {
  getItem: vi.fn(async (_key: string): Promise<string | null> => null),
  setItem: vi.fn(
    async (_key: string, _value: string): Promise<void> => undefined,
  ),
  removeItem: vi.fn(async (_key: string): Promise<void> => undefined),
};
