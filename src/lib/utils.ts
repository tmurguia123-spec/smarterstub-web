import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPriceRange(min: number | null, max: number | null) {
  if (typeof min === "number" && typeof max === "number") {
    if (min === max) {
      return formatCurrency(min);
    }

    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  if (typeof min === "number") {
    return `From ${formatCurrency(min)}`;
  }

  if (typeof max === "number") {
    return `Up to ${formatCurrency(max)}`;
  }

  return "Price unavailable";
}

export function formatDate(date: string | null) {
  if (!date) {
    return "Date TBD";
  }

  const [year, month, day] = date.split("-").map(Number);
  const normalizedDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1));

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(normalizedDate);
}

export function formatTime(value: string | null) {
  if (!value) {
    return "Time TBD";
  }

  if (/am|pm/i.test(value)) {
    return value;
  }

  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = minuteRaw ?? "00";

  if (Number.isNaN(hour)) {
    return value;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${minute.slice(0, 2)} ${period}`;
}
