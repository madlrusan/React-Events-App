import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Use a single utility so components can compose conditional classes safely.
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
