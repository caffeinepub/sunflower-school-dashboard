import {
  AlertCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { INR, MONTHS, type Month, type Student, fmt } from "../types";

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  feeAmount: number;
  setFeeAmount: React.Dispatch<React.SetStateAction<number>>;
}

const currentMonthName = new Date().toLocaleString("default", {
  month: "short",
}) as Month;

export default function FeeTab({
  students,
  setStudents,
  feeAmount,
  setFeeAmount,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleFee = useCallback(
    (studentId: string, month: Month) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, fees: { ...s.fees, [month]: !s.fees[month] } }
            : s,
        ),
      );
    },
    [setStudents],
  );

  const addStudent = useCallback(() => {
    const newStudent: Student = {
      id: Date.now().toString(),
      name: "",
      grade: "",
      fees: {},
    };
    setStudents((prev) => [...prev, newStudent]);
  }, [setStudents]);

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

  const totalPaidCurrentMonth = students.filter(
    (s) => s.fees[currentMonthName],
  ).length;
  const totalUnpaid = students.length - totalPaidCurrentMonth;
  const feesCollected = totalPaidCurrentMonth * feeAmount;

  return (
    <div className="space-y-6">
      {/* Summary */}
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
              Fees Collected ({currentMonthName})
            </p>
            <p className="text-xl font-bold font-mono text-[#00ff88]">
              {INR} {fmt(feesCollected)}
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
            <p className="text-2xl font-bold font-mono text-[#ff4444]">
              {totalUnpaid}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0a0a0]" />
            <input
              data-ocid="fee.search_input"
              className="hud-input pl-8 pr-3 py-1.5 w-56 rounded-sm"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a0a0a0] whitespace-nowrap">
              Fee/Month:
            </span>
            <span className="text-sm text-[#a0a0a0] font-mono">{INR}</span>
            <input
              type="number"
              className="hud-input w-24 px-2 py-1.5 rounded-sm"
              value={feeAmount}
              placeholder="Amount"
              onChange={(e) => setFeeAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <button
          type="button"
          data-ocid="fee.add_button"
          onClick={addStudent}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/20 transition-all"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Student
        </button>
      </div>

      {/* Student grid */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div
            data-ocid="fee.empty_state"
            className="glass-card rounded-sm py-12 text-center text-[#a0a0a0] text-sm"
          >
            {search
              ? "No students match your search."
              : "No students added yet."}
          </div>
        )}
        {filtered.map((student, idx) => (
          <div
            key={student.id}
            data-ocid={`fee.row.${idx + 1}`}
            className="glass-card rounded-sm p-3"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Student info */}
              <div className="flex items-center gap-3 min-w-0 lg:w-72">
                <div className="flex-1 flex gap-2">
                  <input
                    className="hud-input flex-1 min-w-0 px-2 py-1 rounded-sm text-xs"
                    value={student.name}
                    placeholder="Student Name"
                    onChange={(e) =>
                      updateStudent(student.id, "name", e.target.value)
                    }
                  />
                  <input
                    className="hud-input w-24 px-2 py-1 rounded-sm text-xs"
                    value={student.grade}
                    placeholder="Class"
                    onChange={(e) =>
                      updateStudent(student.id, "grade", e.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  data-ocid={`fee.delete_button.${idx + 1}`}
                  onClick={() => deleteStudent(student.id)}
                  className="p-1.5 rounded-sm text-[#a0a0a0] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-all shrink-0"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Monthly fee grid */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {MONTHS.map((month) => {
                  const paid = !!student.fees[month];
                  return (
                    <button
                      type="button"
                      key={month}
                      onClick={() => toggleFee(student.id, month)}
                      className={`px-2 py-1 rounded-sm text-xs font-mono font-medium transition-all duration-150 select-none ${
                        paid ? "paid-cell" : "unpaid-cell"
                      } ${month === currentMonthName ? "ring-1 ring-white/30" : ""}`}
                      title={`${month}: ${paid ? "Paid" : "Unpaid"}`}
                    >
                      <span className="hidden sm:inline">
                        {paid ? "✓" : "✗"}{" "}
                      </span>
                      {month}
                    </button>
                  );
                })}
              </div>

              {/* Paid count */}
              <div className="shrink-0 text-right">
                <span className="font-mono text-xs text-[#a0a0a0]">
                  {Object.values(student.fees).filter(Boolean).length}/12
                </span>
                <p className="text-xs text-[#00ff88] font-mono">
                  {INR}{" "}
                  {fmt(
                    Object.values(student.fees).filter(Boolean).length *
                      feeAmount,
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
