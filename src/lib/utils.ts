import { type DateArg, subMinutes, subHours, subDays } from "date-fns";
import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomInt(max = 1, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random date from the past within a few minutes, hours, or days from now.
 * Uses date-fns for date manipulation.
 * @returns {Date} A random past Date object
 */
export function genDateFromRange(dateCursor: DateArg<Date> = new Date()): Date {
  // Randomly choose the range type: minutes, hours, or days
  const rangeType = { 0: "minutes", 1: "hours", 2: "days" }[randomInt(3)];

  switch (rangeType) {
    case "minutes": {
      const minutes = randomInt(59); // Random minutes between 1 and 59
      return subMinutes(dateCursor, minutes);
    }
    case "hours": {
      const hours = randomInt(23, 1); // Random hours between 1 and 23
      return subHours(dateCursor, hours);
    }
    default: {
      const days = randomInt(7, 1); // Random days between 1 and 7
      return subDays(dateCursor, days);
    }
  }
}
