import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  TruckIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { INR, MONTHS, type Month, type Student, fmt } from "../types";

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const currentMonthName = new Date().toLocaleString("default", {
  month: "short",
}) as Month;

export default function FeeTab({ students, setStudents }: Props) {
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [newClassInput, setNewClassInput] = useState("");
  const [showNewClassInput, setShowNewClassInput] = useState(false);

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
      field: "fees" | "generatorFees" | "transportFees",
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
        fees: {},
        generatorFees: {},
        transportFees: {},
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
    if (s.generatorCharge > 0 && s.generatorFees[currentMonthName])
      sum += s.generatorCharge;
    if (s.transportCharge > 0 && s.transportFees[currentMonthName])
      sum += s.transportCharge;
    return acc + sum;
  }, 0);

  const totalPending = students.reduce((acc, s) => {
    let sum = 0;
    if (!s.fees[currentMonthName]) sum += s.classFee;
    if (s.generatorCharge > 0 && !s.generatorFees[currentMonthName])
      sum += s.generatorCharge;
    if (s.transportCharge > 0 && !s.transportFees[currentMonthName])
      sum += s.transportCharge;
    return acc + sum;
  }, 0);

  const groupCollected = (grpStudents: Student[]) =>
    grpStudents.reduce((sum, s) => {
      let amount = sum;
      if (s.fees[currentMonthName]) amount += s.classFee;
      if (s.generatorCharge > 0 && s.generatorFees[currentMonthName])
        amount += s.generatorCharge;
      if (s.transportCharge > 0 && s.transportFees[currentMonthName])
        amount += s.transportCharge;
      return amount;
    }, 0);

  const studentTotalPaid = (s: Student) => {
    let total = 0;
    for (const m of MONTHS) {
      if (s.fees[m]) total += s.classFee;
      if (s.generatorCharge > 0 && s.generatorFees[m])
        total += s.generatorCharge;
      if (s.transportCharge > 0 && s.transportFees[m])
        total += s.transportCharge;
    }
    return total;
  };

  // All students in display order for deterministic index
  const allDisplayedStudents = groups.flatMap(([, ss]) => ss);

  return (
    <div className="space-y-6">
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
    field: "fees" | "generatorFees" | "transportFees",
  ) => void;
  onUpdate: <K extends keyof Student>(
    id: string,
    field: K,
    value: Student[K],
  ) => void;
  onDelete: (id: string) => void;
  totalPaid: number;
}

function StudentRow({
  student,
  index,
  onToggleFee,
  onUpdate,
  onDelete,
  totalPaid,
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
            className={`hud-input w-20 px-2 py-1 rounded-sm text-xs ${
              student.generatorCharge === 0 ? "opacity-40" : ""
            }`}
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
            className={`hud-input w-20 px-2 py-1 rounded-sm text-xs ${
              student.transportCharge === 0 ? "opacity-40" : ""
            }`}
            value={student.transportCharge}
            onChange={(e) =>
              onUpdate(student.id, "transportCharge", Number(e.target.value))
            }
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-[#a0a0a0] font-mono">Total Paid</p>
            <p className="text-sm font-bold font-mono text-[#00ff88]">
              {INR} {fmt(totalPaid)}
            </p>
          </div>
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

      {/* Row 3: Generator toggles (only if applicable) */}
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

      {/* Row 4: Transport toggles (only if applicable) */}
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
    </div>
  );
}
