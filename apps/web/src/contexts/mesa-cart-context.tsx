"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

type MesaCartContextValue = {
  mesaId: string;
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeLine: (menuItemId: string) => void;
  clear: () => void;
  subtotalCents: number;
  itemCount: number;
};

const MesaCartContext = createContext<MesaCartContextValue | null>(null);

export function MesaCartProvider({
  mesaId,
  children,
}: {
  mesaId: string;
  children: ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const q = line.quantity ?? 1;
      setLines((prev) => {
        const i = prev.findIndex((l) => l.menuItemId === line.menuItemId);
        if (i === -1) {
          return [...prev, { ...line, quantity: q }];
        }
        const next = [...prev];
        next[i] = {
          ...next[i],
          quantity: next[i].quantity + q,
        };
        return next;
      });
    },
    [],
  );

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
      return;
    }
    setLines((prev) =>
      prev.map((l) =>
        l.menuItemId === menuItemId ? { ...l, quantity } : l,
      ),
    );
  }, []);

  const removeLine = useCallback((menuItemId: string) => {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotalCents = useMemo(
    () =>
      lines.reduce(
        (acc, l) => acc + l.unitPriceCents * l.quantity,
        0,
      ),
    [lines],
  );

  const itemCount = useMemo(
    () => lines.reduce((acc, l) => acc + l.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      mesaId,
      lines,
      addLine,
      setQuantity,
      removeLine,
      clear,
      subtotalCents,
      itemCount,
    }),
    [
      mesaId,
      lines,
      addLine,
      setQuantity,
      removeLine,
      clear,
      subtotalCents,
      itemCount,
    ],
  );

  return (
    <MesaCartContext.Provider value={value}>{children}</MesaCartContext.Provider>
  );
}

export function useMesaCart() {
  const ctx = useContext(MesaCartContext);
  if (!ctx) {
    throw new Error("useMesaCart deve ser usado dentro de MesaCartProvider");
  }
  return ctx;
}
