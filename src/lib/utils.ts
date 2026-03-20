import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateString: string | null | undefined, includeTime = false): string {
  if (!dateString) return "-";
  try {
    const date = parseISO(dateString);
    return format(date, includeTime ? "dd/MM/yyyy 'às' HH:mm" : "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    return dateString;
  }
}
