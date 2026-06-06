// Shared input validation + formatters.
// 👉 Tweak the regexes below to match your institute's ID / room formats.
import { z } from "zod";

// Phone: accepts "+91 98765 43210" style — 10–15 digits once non-digits are stripped.
export const phoneRegex = /^[+\d][\d\s\-()]{8,18}\d$/;

// Student ID: letters + digits, e.g. "PAT2026091". 6–20 chars.
export const studentIdRegex = /^[A-Z]{2,5}\d{4,12}$/;

// Hostel: letters/spaces, e.g. "Tagore Hostel".
export const hostelRegex = /^[A-Za-z][A-Za-z .'-]{1,40}$/;

// Room: letter-block-dash-number, e.g. "B-204" or "A12".
export const roomRegex = /^[A-Za-z]{1,3}[- ]?\d{1,4}[A-Za-z]?$/;

// Format helpers used on blur/while typing.
export const formatPhone = (v: string) => {
  const d = v.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  // Indian-style grouping: 5+5 with optional +91.
  const only = d.slice(0, 12);
  if (only.length <= 5) return only;
  if (only.length <= 10) return `${only.slice(0, 5)} ${only.slice(5)}`;
  return `+${only.slice(0, 2)} ${only.slice(2, 7)} ${only.slice(7)}`;
};
export const formatStudentId = (v: string) =>
  v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
export const formatRoom = (v: string) => {
  const cleaned = v.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  return cleaned.slice(0, 8);
};
export const formatHostel = (v: string) => v.replace(/[^A-Za-z .'-]/g, "").slice(0, 40);

// Zod schema used by the profile form.
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone (e.g. +91 98765 43210)"),
  hostel: z.string().trim().regex(hostelRegex, "Hostel name looks invalid"),
  roomNo: z.string().trim().regex(roomRegex, "Use a format like B-204"),
  studentId: z.string().trim().regex(studentIdRegex, "Use letters + digits, e.g. PAT2026091"),
});
export type ProfileForm = z.infer<typeof profileSchema>;
