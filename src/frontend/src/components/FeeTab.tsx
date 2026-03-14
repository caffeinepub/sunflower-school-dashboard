import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GraduationCapIcon,
  PlusIcon,
  PrinterIcon,
  SearchIcon,
  Trash2Icon,
  TruckIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  INR,
  MONTHS,
  type Month,
  type Student,
  type StudentDetail,
  fmt,
} from "../types";

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  studentDetails: StudentDetail[];
  initialSearch?: string;
}

const currentMonthName = new Date().toLocaleString("default", {
  month: "short",
}) as Month;

// ── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptModal({
  student,
  detail,
  onClose,
}: {
  student: Student;
  detail: StudentDetail | undefined;
  onClose: () => void;
}) {
  const receiptNo = `RCP-${student.id.slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Months that are paid for each charge
  const paidTuitionMonths = MONTHS.filter((m) => student.fees[m]);
  const paidGenMonths = MONTHS.filter((m) => student.generatorFees[m]);
  const paidTransMonths = MONTHS.filter((m) => student.transportFees[m]);
  const paidExamMonths = MONTHS.filter((m) => student.examFees?.[m]);

  const tuitionTotal = paidTuitionMonths.length * student.classFee;
  const genTotal = paidGenMonths.length * student.generatorCharge;
  const transTotal = paidTransMonths.length * student.transportCharge;
  const examTotal = paidExamMonths.length * (student.examCharge ?? 0);
  const grandTotal = tuitionTotal + genTotal + transTotal + examTotal;

  const handlePrint = () => {
    const printContents =
      document.getElementById("fee-receipt-print")?.innerHTML;
    if (!printContents) return;

    // Use a hidden iframe to avoid popup blockers
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${student.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #fff; color: #000; padding: 20px; }
          .receipt { max-width: 560px; margin: 0 auto; border: 2px solid #000; padding: 24px; }
          .school-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
          .school-name { font-size: 22px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
          .school-sub { font-size: 12px; color: #444; margin-top: 4px; }
          .receipt-title { text-align: center; font-size: 16px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; background: #000; color: #fff; padding: 6px; }
          .meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
          .student-box { border: 1px solid #ccc; padding: 10px; margin-bottom: 16px; font-size: 13px; }
          .student-box .label { color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
          .student-box .value { font-weight: bold; }
          .fees-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
          .fees-table th { background: #000; color: #fff; padding: 6px 10px; text-align: left; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
          .fees-table td { padding: 6px 10px; border-bottom: 1px solid #eee; }
          .fees-table tr:last-child td { border-bottom: none; }
          .months-list { font-size: 11px; color: #555; }
          .total-row td { font-weight: bold; font-size: 14px; border-top: 2px solid #000 !important; }
          .footer { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid #ccc; font-size: 12px; }
          .sig-line { border-top: 1px solid #000; width: 140px; text-align: center; padding-top: 4px; margin-top: 24px; font-size: 11px; color: #555; }
          .watermark { text-align: center; margin-top: 12px; font-size: 10px; color: #aaa; letter-spacing: 2px; }
        </style>
      </head>
      <body>${printContents}</body>
      </html>`);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 400);
  };

  return (
    <div
      data-ocid="fee.receipt_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="w-full max-w-lg glass-card rounded-sm overflow-hidden"
        style={{
          borderColor: "rgba(0,245,255,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-bold text-[#00f5ff] tracking-widest uppercase flex items-center gap-2">
            <PrinterIcon className="w-4 h-4" />
            Fee Receipt
          </h2>
          <button
            type="button"
            data-ocid="fee.receipt_modal.close_button"
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-all"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt preview */}
        <div className="p-5">
          <div id="fee-receipt-print">
            <div
              className="receipt"
              style={{
                fontFamily: "Arial, sans-serif",
                border: "2px solid #ddd",
                padding: "24px",
                background: "#fff",
                color: "#000",
              }}
            >
              {/* School Header */}
              <div
                style={{
                  textAlign: "center",
                  borderBottom: "2px solid #000",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  SUNFLOWER PUBLIC SCHOOL
                </div>
                <div
                  style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}
                >
                  Director: Kausar Parween
                </div>
              </div>

              {/* Receipt Title */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  background: "#000",
                  color: "#fff",
                  padding: "6px",
                  marginBottom: "16px",
                }}
              >
                FEE RECEIPT
              </div>

              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "12px",
                }}
              >
                <span>
                  <strong>Receipt No:</strong> {receiptNo}
                </span>
                <span>
                  <strong>Date:</strong> {today}
                </span>
              </div>

              {/* Student Info */}
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Student Name
                    </div>
                    <div style={{ fontWeight: "bold" }}>{student.name}</div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Class
                    </div>
                    <div style={{ fontWeight: "bold" }}>{student.grade}</div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Father's Name
                    </div>
                    <div style={{ fontWeight: "bold" }}>
                      {detail?.fatherName || "—"}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Father's Phone
                    </div>
                    <div style={{ fontWeight: "bold" }}>
                      {detail?.fatherPhone || "—"}
                    </div>
                  </div>
                  {detail?.motherName && (
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#555",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Mother's Name
                      </div>
                      <div style={{ fontWeight: "bold" }}>
                        {detail.motherName}
                      </div>
                    </div>
                  )}
                  {detail?.age && (
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#555",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Age
                      </div>
                      <div style={{ fontWeight: "bold" }}>
                        {detail.age} years
                      </div>
                    </div>
                  )}
                  {detail?.bloodGroup && (
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#555",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Blood Group
                      </div>
                      <div style={{ fontWeight: "bold" }}>
                        {detail.bloodGroup}
                      </div>
                    </div>
                  )}
                  {detail?.address && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#555",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Address
                      </div>
                      <div style={{ fontWeight: "bold" }}>{detail.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fees Table */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ background: "#000", color: "#fff" }}>
                    <th
                      style={{
                        padding: "6px 10px",
                        textAlign: "left",
                        fontSize: "11px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        padding: "6px 10px",
                        textAlign: "left",
                        fontSize: "11px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      Months
                    </th>
                    <th
                      style={{
                        padding: "6px 10px",
                        textAlign: "right",
                        fontSize: "11px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paidTuitionMonths.length > 0 && (
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 10px" }}>
                        Tuition Fee ({INR}
                        {fmt(student.classFee)}/mo)
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: "11px",
                          color: "#555",
                        }}
                      >
                        {paidTuitionMonths.join(", ")}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {INR} {fmt(tuitionTotal)}
                      </td>
                    </tr>
                  )}
                  {paidGenMonths.length > 0 && (
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 10px" }}>
                        Generator Charge ({INR}
                        {fmt(student.generatorCharge)}/mo)
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: "11px",
                          color: "#555",
                        }}
                      >
                        {paidGenMonths.join(", ")}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {INR} {fmt(genTotal)}
                      </td>
                    </tr>
                  )}
                  {paidTransMonths.length > 0 && (
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 10px" }}>
                        Transport Charge ({INR}
                        {fmt(student.transportCharge)}/mo)
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: "11px",
                          color: "#555",
                        }}
                      >
                        {paidTransMonths.join(", ")}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {INR} {fmt(transTotal)}
                      </td>
                    </tr>
                  )}
                  {paidExamMonths.length > 0 && (
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 10px" }}>
                        Examination Fee ({INR}
                        {fmt(student.examCharge ?? 0)}/sitting)
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: "11px",
                          color: "#555",
                        }}
                      >
                        {paidExamMonths.join(", ")}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {INR} {fmt(examTotal)}
                      </td>
                    </tr>
                  )}
                  {/* Summary of all charges per month */}
                  {(student.classFee > 0 ||
                    (student.generatorCharge ?? 0) > 0 ||
                    (student.transportCharge ?? 0) > 0 ||
                    (student.examCharge ?? 0) > 0) && (
                    <tr
                      style={{
                        borderBottom: "2px solid #ddd",
                        background: "#f9f9f9",
                      }}
                    >
                      <td
                        colSpan={2}
                        style={{
                          padding: "6px 10px",
                          fontSize: "11px",
                          color: "#555",
                          fontStyle: "italic",
                        }}
                      >
                        Monthly breakdown: Tuition {INR}
                        {fmt(student.classFee)}
                        {(student.generatorCharge ?? 0) > 0
                          ? ` + Generator ${INR}${fmt(student.generatorCharge)}`
                          : ""}
                        {(student.transportCharge ?? 0) > 0
                          ? ` + Transport ${INR}${fmt(student.transportCharge)}`
                          : ""}
                        {(student.examCharge ?? 0) > 0
                          ? ` + Exam ${INR}${fmt(student.examCharge ?? 0)}`
                          : ""}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          textAlign: "right",
                          fontSize: "11px",
                          color: "#555",
                        }}
                      >
                        {INR}{" "}
                        {fmt(
                          student.classFee +
                            (student.generatorCharge ?? 0) +
                            (student.transportCharge ?? 0) +
                            (student.examCharge ?? 0),
                        )}
                        /mo
                      </td>
                    </tr>
                  )}
                  {paidTuitionMonths.length === 0 &&
                    paidGenMonths.length === 0 &&
                    paidTransMonths.length === 0 &&
                    paidExamMonths.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            padding: "12px 10px",
                            textAlign: "center",
                            color: "#999",
                            fontSize: "12px",
                          }}
                        >
                          No fees marked as paid yet
                        </td>
                      </tr>
                    )}
                  <tr style={{ borderTop: "2px solid #000" }}>
                    <td
                      colSpan={2}
                      style={{
                        padding: "10px 10px",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      GRAND TOTAL
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        textAlign: "right",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {INR} {fmt(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #ccc",
                  fontSize: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      borderTop: "1px solid #000",
                      width: "140px",
                      paddingTop: "4px",
                      marginTop: "32px",
                      fontSize: "11px",
                      color: "#555",
                      textAlign: "center",
                    }}
                  >
                    Parent / Guardian Signature
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      borderTop: "1px solid #000",
                      width: "140px",
                      paddingTop: "4px",
                      marginTop: "32px",
                      fontSize: "11px",
                      color: "#555",
                      textAlign: "center",
                    }}
                  >
                    Authorized Signature
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  marginTop: "12px",
                  fontSize: "10px",
                  color: "#aaa",
                  letterSpacing: "2px",
                }}
              >
                SUNFLOWER PUBLIC SCHOOL · OFFICIAL FEE RECEIPT
              </div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            type="button"
            data-ocid="fee.receipt_modal.cancel_button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-sm bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-all"
          >
            Close
          </button>
          <button
            type="button"
            data-ocid="fee.receipt_modal.print_button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-sm bg-[#00f5ff]/20 border border-[#00f5ff]/50 text-[#00f5ff] hover:bg-[#00f5ff]/30 transition-all"
            style={{ boxShadow: "0 0 12px rgba(0,245,255,0.2)" }}
          >
            <PrinterIcon className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function FeeTab({
  students,
  setStudents,
  studentDetails,
  initialSearch,
}: Props) {
  const [search, setSearch] = useState(initialSearch ?? "");
  useEffect(() => {
    setSearch(initialSearch ?? "");
  }, [initialSearch]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [newClassInput, setNewClassInput] = useState("");
  const [showNewClassInput, setShowNewClassInput] = useState(false);
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase()),
  );

  // Group by grade
  const groupMap = new Map<string, Student[]>();
  for (const s of filtered) {
    const key = s.grade || "Unassigned";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(s);
  }
  const groups = Array.from(groupMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const toggleGroup = useCallback((grade: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) next.delete(grade);
      else next.add(grade);
      return next;
    });
  }, []);

  const toggleFee = useCallback(
    (
      studentId: string,
      month: Month,
      field: "fees" | "generatorFees" | "transportFees" | "examFees",
    ) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, [field]: { ...s[field], [month]: !s[field][month] } }
            : s,
        ),
      );
    },
    [setStudents],
  );

  const addStudent = useCallback(
    (grade = "") => {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: "",
        grade,
        classFee: 500,
        generatorCharge: 0,
        transportCharge: 0,
        examCharge: 0,
        fees: {},
        generatorFees: {},
        transportFees: {},
        examFees: {},
      };
      setStudents((prev) => [...prev, newStudent]);
    },
    [setStudents],
  );

  const deleteStudent = useCallback(
    (id: string) => {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    },
    [setStudents],
  );

  const updateStudent = useCallback(
    <K extends keyof Student>(id: string, field: K, value: Student[K]) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [setStudents],
  );

  // Summary calculations
  const totalCollected = students.reduce((acc, s) => {
    let sum = 0;
    if (s.fees[currentMonthName]) sum += s.classFee;
    if ((s.generatorCharge ?? 0) > 0 && s.generatorFees[currentMonthName])
      sum += s.generatorCharge;
    if ((s.transportCharge ?? 0) > 0 && s.transportFees[currentMonthName])
      sum += s.transportCharge;
    if ((s.examCharge ?? 0) > 0 && s.examFees?.[currentMonthName])
      sum += s.examCharge ?? 0;
    return acc + sum;
  }, 0);

  const totalPending = students.reduce((acc, s) => {
    let sum = 0;
    if (!s.fees[currentMonthName]) sum += s.classFee;
    if ((s.generatorCharge ?? 0) > 0 && !s.generatorFees[currentMonthName])
      sum += s.generatorCharge;
    if ((s.transportCharge ?? 0) > 0 && !s.transportFees[currentMonthName])
      sum += s.transportCharge;
    if ((s.examCharge ?? 0) > 0 && !s.examFees?.[currentMonthName])
      sum += s.examCharge ?? 0;
    return acc + sum;
  }, 0);

  const groupCollected = (grpStudents: Student[]) =>
    grpStudents.reduce((sum, s) => {
      let amount = sum;
      if (s.fees[currentMonthName]) amount += s.classFee;
      if ((s.generatorCharge ?? 0) > 0 && s.generatorFees[currentMonthName])
        amount += s.generatorCharge;
      if ((s.transportCharge ?? 0) > 0 && s.transportFees[currentMonthName])
        amount += s.transportCharge;
      if ((s.examCharge ?? 0) > 0 && s.examFees?.[currentMonthName])
        amount += s.examCharge ?? 0;
      return amount;
    }, 0);

  const studentTotalPaid = (s: Student) => {
    let total = 0;
    for (const m of MONTHS) {
      if (s.fees[m]) total += s.classFee;
      if ((s.generatorCharge ?? 0) > 0 && s.generatorFees[m])
        total += s.generatorCharge;
      if ((s.transportCharge ?? 0) > 0 && s.transportFees[m])
        total += s.transportCharge;
      if ((s.examCharge ?? 0) > 0 && s.examFees?.[m])
        total += s.examCharge ?? 0;
    }
    return total;
  };

  const allDisplayedStudents = groups.flatMap(([, ss]) => ss);

  // Find matching detail record for receipt
  const getDetail = (s: Student) =>
    studentDetails.find(
      (d) =>
        d.name.trim().toLowerCase() === s.name.trim().toLowerCase() &&
        d.grade === s.grade,
    );

  return (
    <div className="space-y-6">
      {/* Receipt Modal */}
      {receiptStudent && (
        <ReceiptModal
          student={receiptStudent}
          detail={getDetail(receiptStudent)}
          onClose={() => setReceiptStudent(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-[#00f5ff]/10 border border-[#00f5ff]/30">
            <UsersIcon className="w-5 h-5 text-[#00f5ff]" />
          </div>
          <div>
            <p className="text-xs text-[#a0a0a0] tracking-widest uppercase">
              Total Students
            </p>
            <p className="text-2xl font-bold font-mono text-white">
              {students.length}
            </p>
          </div>
        </div>
        <div className="glass-card rounded-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-[#00ff88]/10 border border-[#00ff88]/30">
            <CheckCircleIcon className="w-5 h-5 text-[#00ff88]" />
          </div>
          <div>
            <p className="text-xs text-[#a0a0a0] tracking-widest uppercase">
              Collected ({currentMonthName})
            </p>
            <p className="text-xl font-bold font-mono text-[#00ff88]">
              {INR} {fmt(totalCollected)}
            </p>
          </div>
        </div>
        <div className="glass-card rounded-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-[#ff4444]/10 border border-[#ff4444]/30">
            <AlertCircleIcon className="w-5 h-5 text-[#ff4444]" />
          </div>
          <div>
            <p className="text-xs text-[#a0a0a0] tracking-widest uppercase">
              Pending ({currentMonthName})
            </p>
            <p className="text-xl font-bold font-mono text-[#ff4444]">
              {INR} {fmt(totalPending)}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0a0a0]" />
          <input
            data-ocid="fee.search_input"
            className="hud-input pl-8 pr-3 py-1.5 w-64 rounded-sm"
            placeholder="Search by name or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {showNewClassInput ? (
            <div className="flex items-center gap-2">
              <input
                className="hud-input px-2 py-1.5 w-36 rounded-sm text-xs"
                placeholder="Class name..."
                value={newClassInput}
                onChange={(e) => setNewClassInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newClassInput.trim()) {
                    addStudent(newClassInput.trim());
                    setNewClassInput("");
                    setShowNewClassInput(false);
                  } else if (e.key === "Escape") {
                    setShowNewClassInput(false);
                    setNewClassInput("");
                  }
                }}
                ref={(el) => el?.focus()}
              />
              <button
                type="button"
                onClick={() => {
                  if (newClassInput.trim()) {
                    addStudent(newClassInput.trim());
                    setNewClassInput("");
                    setShowNewClassInput(false);
                  }
                }}
                className="px-3 py-1.5 text-xs rounded-sm bg-[#00f5ff]/20 border border-[#00f5ff]/40 text-[#00f5ff] hover:bg-[#00f5ff]/30 transition-all"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewClassInput(false);
                  setNewClassInput("");
                }}
                className="px-2 py-1.5 text-xs rounded-sm bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowNewClassInput(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm bg-white/5 border border-white/10 text-[#a0a0a0] hover:bg-[#00f5ff]/10 hover:text-[#00f5ff] hover:border-[#00f5ff]/30 transition-all"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add Class Group
              </button>
              <button
                type="button"
                data-ocid="fee.add_button"
                onClick={() => addStudent()}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/20 transition-all"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add Student
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grouped Sections */}
      <div className="space-y-4">
        {groups.length === 0 && (
          <div
            data-ocid="fee.empty_state"
            className="glass-card rounded-sm py-12 text-center text-[#a0a0a0] text-sm"
          >
            {search
              ? "No students match your search."
              : "No students added yet."}
          </div>
        )}
        {groups.map(([grade, grpStudents], groupIdx) => {
          const isCollapsed = collapsedGroups.has(grade);
          const collected = groupCollected(grpStudents);
          return (
            <div key={grade} className="glass-card rounded-sm overflow-hidden">
              {/* Group Header */}
              <button
                type="button"
                data-ocid={`fee.class_group.${groupIdx + 1}`}
                onClick={() => toggleGroup(grade)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRightIcon className="w-4 h-4 text-[#00f5ff]" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-[#00f5ff]" />
                  )}
                  <span className="font-mono text-sm font-bold text-[#00f5ff] tracking-wider">
                    {grade.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#a0a0a0] font-mono">
                    {grpStudents.length} student
                    {grpStudents.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#00ff88] font-mono">
                    {currentMonthName} collected: {INR} {fmt(collected)}
                  </span>
                </div>
              </button>

              {/* Students */}
              {!isCollapsed && (
                <div className="divide-y divide-white/5">
                  {grpStudents.map((student) => {
                    const globalIdx = allDisplayedStudents.findIndex(
                      (s) => s.id === student.id,
                    );
                    return (
                      <StudentRow
                        key={student.id}
                        student={student}
                        index={globalIdx + 1}
                        onToggleFee={toggleFee}
                        onUpdate={updateStudent}
                        onDelete={deleteStudent}
                        totalPaid={studentTotalPaid(student)}
                        onPrintReceipt={() => setReceiptStudent(student)}
                      />
                    );
                  })}
                  {/* Add student to this group */}
                  <div className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => addStudent(grade)}
                      className="flex items-center gap-1.5 text-xs text-[#a0a0a0] hover:text-[#00f5ff] transition-all"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Add student to {grade}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RowProps {
  student: Student;
  index: number;
  onToggleFee: (
    id: string,
    month: Month,
    field: "fees" | "generatorFees" | "transportFees" | "examFees",
  ) => void;
  onUpdate: <K extends keyof Student>(
    id: string,
    field: K,
    value: Student[K],
  ) => void;
  onDelete: (id: string) => void;
  totalPaid: number;
  onPrintReceipt: () => void;
}

function StudentRow({
  student,
  index,
  onToggleFee,
  onUpdate,
  onDelete,
  totalPaid,
  onPrintReceipt,
}: RowProps) {
  return (
    <div data-ocid={`fee.row.${index}`} className="px-4 py-3 space-y-3">
      {/* Row 1: Student info inputs */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="hud-input flex-1 min-w-32 px-2 py-1 rounded-sm text-xs"
          value={student.name}
          placeholder="Student Name"
          onChange={(e) => onUpdate(student.id, "name", e.target.value)}
        />
        <input
          className="hud-input w-28 px-2 py-1 rounded-sm text-xs"
          value={student.grade}
          placeholder="Class"
          onChange={(e) => onUpdate(student.id, "grade", e.target.value)}
        />
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#a0a0a0] whitespace-nowrap">
            Tuition {INR}
          </span>
          <input
            type="number"
            className="hud-input w-20 px-2 py-1 rounded-sm text-xs"
            value={student.classFee}
            onChange={(e) =>
              onUpdate(student.id, "classFee", Number(e.target.value))
            }
          />
        </div>
        <div className="flex items-center gap-1">
          <ZapIcon
            className={`w-3 h-3 ${student.generatorCharge > 0 ? "text-amber-400" : "text-[#444]"}`}
          />
          <span
            className={`text-xs whitespace-nowrap ${student.generatorCharge > 0 ? "text-amber-400" : "text-[#444]"}`}
          >
            Gen {INR}
          </span>
          <input
            type="number"
            className={`hud-input w-20 px-2 py-1 rounded-sm text-xs ${student.generatorCharge === 0 ? "opacity-40" : ""}`}
            value={student.generatorCharge}
            onChange={(e) =>
              onUpdate(student.id, "generatorCharge", Number(e.target.value))
            }
          />
        </div>
        <div className="flex items-center gap-1">
          <TruckIcon
            className={`w-3 h-3 ${student.transportCharge > 0 ? "text-blue-400" : "text-[#444]"}`}
          />
          <span
            className={`text-xs whitespace-nowrap ${student.transportCharge > 0 ? "text-blue-400" : "text-[#444]"}`}
          >
            Transport {INR}
          </span>
          <input
            type="number"
            className={`hud-input w-20 px-2 py-1 rounded-sm text-xs ${student.transportCharge === 0 ? "opacity-40" : ""}`}
            value={student.transportCharge}
            onChange={(e) =>
              onUpdate(student.id, "transportCharge", Number(e.target.value))
            }
          />
        </div>
        <div className="flex items-center gap-1">
          <GraduationCapIcon
            className={`w-3 h-3 ${(student.examCharge ?? 0) > 0 ? "text-purple-400" : "text-[#444]"}`}
          />
          <span
            className={`text-xs whitespace-nowrap ${(student.examCharge ?? 0) > 0 ? "text-purple-400" : "text-[#444]"}`}
          >
            Exam {INR}
          </span>
          <input
            type="number"
            className={`hud-input w-20 px-2 py-1 rounded-sm text-xs ${(student.examCharge ?? 0) === 0 ? "opacity-40" : ""}`}
            value={student.examCharge ?? 0}
            onChange={(e) =>
              onUpdate(student.id, "examCharge", Number(e.target.value))
            }
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-[#a0a0a0] font-mono">Total Paid</p>
            <p className="text-sm font-bold font-mono text-[#00ff88]">
              {INR} {fmt(totalPaid)}
            </p>
          </div>
          {/* Print Receipt button */}
          <button
            type="button"
            data-ocid={`fee.print_receipt_button.${index}`}
            onClick={onPrintReceipt}
            title="Print Fee Receipt"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs bg-[#0066ff]/15 border border-[#0066ff]/30 text-[#6699ff] hover:bg-[#0066ff]/25 hover:text-white transition-all"
          >
            <PrinterIcon className="w-3.5 h-3.5" />
            Receipt
          </button>
          <button
            type="button"
            data-ocid={`fee.delete_button.${index}`}
            onClick={() => onDelete(student.id)}
            className="p-1.5 rounded-sm text-[#a0a0a0] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-all"
          >
            <Trash2Icon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Tuition month toggles */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs text-[#a0a0a0] w-16 shrink-0">Tuition:</span>
        {MONTHS.map((month) => {
          const paid = !!student.fees[month];
          return (
            <button
              type="button"
              key={month}
              onClick={() => onToggleFee(student.id, month, "fees")}
              className={`px-2 py-0.5 rounded-sm text-xs font-mono font-medium transition-all duration-150 select-none ${
                paid ? "paid-cell" : "unpaid-cell"
              } ${month === currentMonthName ? "ring-1 ring-white/30" : ""}`}
              title={`Tuition ${month}: ${paid ? "Paid" : "Unpaid"}`}
            >
              {month}
            </button>
          );
        })}
      </div>

      {/* Row 3: Generator toggles */}
      {student.generatorCharge > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-amber-400 w-16 shrink-0">
            Generator:
          </span>
          {MONTHS.map((month) => {
            const paid = !!student.generatorFees[month];
            return (
              <button
                type="button"
                key={month}
                onClick={() => onToggleFee(student.id, month, "generatorFees")}
                className={`px-2 py-0.5 rounded-sm text-xs font-mono font-medium transition-all duration-150 select-none ${
                  paid
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                    : "unpaid-cell"
                } ${month === currentMonthName ? "ring-1 ring-white/30" : ""}`}
                title={`Generator ${month}: ${paid ? "Paid" : "Unpaid"}`}
              >
                {month}
              </button>
            );
          })}
        </div>
      )}

      {/* Row 4: Transport toggles */}
      {student.transportCharge > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-blue-400 w-16 shrink-0">
            Transport:
          </span>
          {MONTHS.map((month) => {
            const paid = !!student.transportFees[month];
            return (
              <button
                type="button"
                key={month}
                onClick={() => onToggleFee(student.id, month, "transportFees")}
                className={`px-2 py-0.5 rounded-sm text-xs font-mono font-medium transition-all duration-150 select-none ${
                  paid
                    ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                    : "unpaid-cell"
                } ${month === currentMonthName ? "ring-1 ring-white/30" : ""}`}
                title={`Transport ${month}: ${paid ? "Paid" : "Unpaid"}`}
              >
                {month}
              </button>
            );
          })}
        </div>
      )}

      {/* Row 5: Exam fee toggles */}
      {(student.examCharge ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-purple-400 w-16 shrink-0">Exam:</span>
          {MONTHS.map((month) => {
            const paid = !!student.examFees?.[month];
            return (
              <button
                type="button"
                key={month}
                onClick={() => onToggleFee(student.id, month, "examFees")}
                className={`px-2 py-0.5 rounded-sm text-xs font-mono font-medium transition-all duration-150 select-none ${
                  paid
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-400"
                    : "unpaid-cell"
                } ${month === currentMonthName ? "ring-1 ring-white/30" : ""}`}
                title={`Exam ${month}: ${paid ? "Paid" : "Unpaid"}`}
              >
                {month}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
