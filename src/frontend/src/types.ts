export interface Staff {
  id: string;
  name: string;
  designation: string;
  baseSalary: number;
  totalDays: number;
  daysPresent: number;
  phone?: string;
  address?: string;
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
  /** Per-class tuition fee (monthly) */
  classFee: number;
  /** Generator charge (monthly, 0 if not applicable) */
  generatorCharge: number;
  /** Transport charge (monthly, 0 if not a transport student) */
  transportCharge: number;
  /** Examination fee (per sitting, 0 if not applicable) */
  examCharge: number;
  fees: Partial<Record<Month, boolean>>;
  generatorFees: Partial<Record<Month, boolean>>;
  transportFees: Partial<Record<Month, boolean>>;
  examFees: Partial<Record<Month, boolean>>;
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
  fatherPhone?: string;
  motherName: string;
  grade: string;
  photo: string; // base64 data URL or empty string
  address?: string;
}

export type MiscCategory = "Uniforms" | "Books" | "Exam Fee" | "Other";

export interface MiscCharge {
  id: string;
  description: string;
  category: MiscCategory;
  amount: number;
  date: string;
}

/**
 * Attendance record.
 * Key: ISO date string "YYYY-MM-DD"
 * Value: Record<staffId, "present" | "absent" | "leave">
 */
export type AttendanceStatus = "present" | "absent" | "leave";
export type DailyAttendance = Record<string, AttendanceStatus>; // staffId -> status
export type AttendanceRecord = Record<string, DailyAttendance>; // dateKey -> DailyAttendance

/**
 * Reporting time record.
 * Key: ISO date string "YYYY-MM-DD"
 * Value: Record<staffId, timeString ("HH:MM")>
 */
export type DailyReportingTimes = Record<string, string>; // staffId -> "HH:MM"
export type ReportingTimesRecord = Record<string, DailyReportingTimes>; // dateKey -> DailyReportingTimes

export function calcFinalSalary(staff: Staff): number {
  if (staff.totalDays === 0) return 0;
  return (staff.baseSalary / staff.totalDays) * staff.daysPresent;
}

export function calcDeduction(staff: Staff): number {
  return staff.baseSalary - calcFinalSalary(staff);
}

/** Total monthly fee for a student */
export function calcMonthlyTotal(student: Student): number {
  return (
    student.classFee +
    student.generatorCharge +
    student.transportCharge +
    student.examCharge
  );
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
