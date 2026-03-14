export interface Staff {
  id: string;
  name: string;
  designation: string;
  baseSalary: number;
  totalDays: number;
  daysPresent: number;
}

export type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

export const MONTHS: Month[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface Student {
  id: string;
  name: string;
  grade: string;
  fees: Partial<Record<Month, boolean>>;
}

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export const BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export interface StudentDetail {
  id: string;
  name: string;
  age: string;
  bloodGroup: BloodGroup;
  fatherName: string;
  motherName: string;
  grade: string;
  photo: string; // base64 data URL or empty string
}

export type MiscCategory = "Uniforms" | "Books" | "Exam Fee" | "Other";

export interface MiscCharge {
  id: string;
  description: string;
  category: MiscCategory;
  amount: number;
  date: string;
}

export function calcFinalSalary(staff: Staff): number {
  if (staff.totalDays === 0) return 0;
  return (staff.baseSalary / staff.totalDays) * staff.daysPresent;
}

export function calcDeduction(staff: Staff): number {
  return staff.baseSalary - calcFinalSalary(staff);
}

/** Format a number as Indian Rupees with 2 decimal places */
export function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Indian Rupee symbol */
export const INR = "\u20B9";
