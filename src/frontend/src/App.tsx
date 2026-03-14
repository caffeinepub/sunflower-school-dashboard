import { Toaster } from "@/components/ui/sonner";
import {
  BuildingIcon,
  CheckCircleIcon,
  DownloadIcon,
  HardDriveIcon,
  LockIcon,
  PrinterIcon,
  UploadIcon,
  ZapIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AttendanceTab from "./components/AttendanceTab";
import DetailsTab from "./components/DetailsTab";
import FeeTab from "./components/FeeTab";
import LoginScreen from "./components/LoginScreen";
import MiscTab from "./components/MiscTab";
import PrintArea from "./components/PrintArea";
import SalaryTab from "./components/SalaryTab";
import type {
  AttendanceRecord,
  MiscCharge,
  Staff,
  Student,
  StudentDetail,
} from "./types";

const TABS = [
  { id: "salary", label: "Salary Payroll" },
  { id: "fee", label: "Fee Ledger" },
  { id: "details", label: "Student Details" },
  { id: "misc", label: "Misc Charges" },
  { id: "attendance", label: "Attendance" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function loadLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getTodayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatBackupDate(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function triggerDownload(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const defaultStaff: Staff[] = [
  {
    id: "1",
    name: "Muhammad Arif",
    designation: "Mathematics Teacher",
    baseSalary: 18000,
    totalDays: 30,
    daysPresent: 28,
    phone: "",
    address: "",
  },
  {
    id: "2",
    name: "Fatima Zahra",
    designation: "Science Teacher",
    baseSalary: 20000,
    totalDays: 30,
    daysPresent: 30,
    phone: "",
    address: "",
  },
  {
    id: "3",
    name: "Tariq Hussain",
    designation: "English Teacher",
    baseSalary: 16000,
    totalDays: 30,
    daysPresent: 25,
    phone: "",
    address: "",
  },
  {
    id: "4",
    name: "Nadia Malik",
    designation: "Urdu Teacher",
    baseSalary: 14000,
    totalDays: 30,
    daysPresent: 29,
    phone: "",
    address: "",
  },
  {
    id: "5",
    name: "Bilal Ahmed",
    designation: "Physical Education",
    baseSalary: 12000,
    totalDays: 30,
    daysPresent: 30,
    phone: "",
    address: "",
  },
];

const defaultStudents: Student[] = [
  {
    id: "1",
    name: "Ayesha Siddiqi",
    grade: "Class 8-A",
    classFee: 1200,
    generatorCharge: 200,
    transportCharge: 0,
    fees: {},
    generatorFees: {},
    transportFees: {},
  },
  {
    id: "2",
    name: "Usman Farooq",
    grade: "Class 7-B",
    classFee: 1000,
    generatorCharge: 200,
    transportCharge: 500,
    fees: { Jan: true, Feb: true, Mar: true },
    generatorFees: { Jan: true },
    transportFees: { Jan: true, Feb: true },
  },
  {
    id: "3",
    name: "Zainab Raza",
    grade: "Class 9-A",
    classFee: 1500,
    generatorCharge: 0,
    transportCharge: 500,
    fees: { Jan: true, Feb: true },
    generatorFees: {},
    transportFees: { Jan: true },
  },
  {
    id: "4",
    name: "Hamza Khan",
    grade: "Class 6-C",
    classFee: 800,
    generatorCharge: 200,
    transportCharge: 0,
    fees: {},
    generatorFees: {},
    transportFees: {},
  },
  {
    id: "5",
    name: "Sana Bashir",
    grade: "Class 10-A",
    classFee: 1800,
    generatorCharge: 200,
    transportCharge: 500,
    fees: { Jan: true, Feb: true, Mar: true, Apr: true },
    generatorFees: { Jan: true, Feb: true },
    transportFees: { Jan: true, Feb: true, Mar: true },
  },
  {
    id: "6",
    name: "Ali Hassan",
    grade: "Class 8-B",
    classFee: 1200,
    generatorCharge: 0,
    transportCharge: 0,
    fees: { Jan: true },
    generatorFees: {},
    transportFees: {},
  },
];

const defaultMisc: MiscCharge[] = [
  {
    id: "1",
    description: "Winter Uniforms",
    category: "Uniforms",
    amount: 2500,
    date: "2026-03-01",
  },
  {
    id: "2",
    description: "Science Textbooks",
    category: "Books",
    amount: 1800,
    date: "2026-03-05",
  },
  {
    id: "3",
    description: "Annual Exam Fee",
    category: "Exam Fee",
    amount: 3000,
    date: "2026-03-10",
  },
];

const defaultStudentDetails: StudentDetail[] = [
  {
    id: "sd1",
    name: "Ayesha Siddiqi",
    age: "14",
    bloodGroup: "B+",
    fatherName: "Imran Siddiqi",
    fatherPhone: "",
    motherName: "Nusrat Siddiqi",
    grade: "Class 8-A",
    photo: "",
    address: "",
  },
  {
    id: "sd2",
    name: "Usman Farooq",
    age: "13",
    bloodGroup: "O+",
    fatherName: "Farooq Ahmed",
    fatherPhone: "",
    motherName: "Saima Farooq",
    grade: "Class 7-B",
    photo: "",
    address: "",
  },
  {
    id: "sd3",
    name: "Zainab Raza",
    age: "15",
    bloodGroup: "A+",
    fatherName: "Raza Khan",
    fatherPhone: "",
    motherName: "Hina Raza",
    grade: "Class 9-A",
    photo: "",
    address: "",
  },
  {
    id: "sd4",
    name: "Sana Bashir",
    age: "16",
    bloodGroup: "AB+",
    fatherName: "Bashir Ahmad",
    fatherPhone: "",
    motherName: "Rukhsana Bashir",
    grade: "Class 10-A",
    photo: "",
    address: "",
  },
];

const TAB_OCID: Record<TabId, string> = {
  salary: "header.salary_tab",
  fee: "header.fee_tab",
  details: "header.details_tab",
  misc: "header.misc_tab",
  attendance: "header.attendance_tab",
};

function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("salary");
  const [staff, setStaff] = useState<Staff[]>(() =>
    loadLS("sunflower_staff", defaultStaff),
  );
  const [students, setStudents] = useState<Student[]>(() =>
    loadLS("sunflower_students", defaultStudents),
  );
  const [misc, setMisc] = useState<MiscCharge[]>(() =>
    loadLS("sunflower_misc", defaultMisc),
  );
  const [studentDetails, setStudentDetails] = useState<StudentDetail[]>(() =>
    loadLS("sunflower_student_details", defaultStudentDetails),
  );
  const [attendance, setAttendance] = useState<AttendanceRecord>(() =>
    loadLS("sunflower_attendance", {}),
  );
  const [lastBackupDate, setLastBackupDate] = useState<string>(
    () => localStorage.getItem("sunflower_last_backup_date") ?? "",
  );

  const importFileRef = useRef<HTMLInputElement>(null);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("sunflower_staff", JSON.stringify(staff));
  }, [staff]);
  useEffect(() => {
    localStorage.setItem("sunflower_students", JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem("sunflower_misc", JSON.stringify(misc));
  }, [misc]);
  useEffect(() => {
    localStorage.setItem(
      "sunflower_student_details",
      JSON.stringify(studentDetails),
    );
  }, [studentDetails]);
  useEffect(() => {
    localStorage.setItem("sunflower_attendance", JSON.stringify(attendance));
  }, [attendance]);

  // ── Auto-sync attendance → daysPresent in Salary tab ────────────────────────
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    setStaff((prev) =>
      prev.map((s) => {
        let present = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          if (attendance[key]?.[s.id] === "present") present++;
        }
        if (present === 0) return s;
        return { ...s, daysPresent: present };
      }),
    );
  }, [attendance]);
  // ────────────────────────────────────────────────────────────────────────────

  // ── Auto daily backup ────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const today = getTodayDateStr();
      if (localStorage.getItem("sunflower_last_backup_date") === today) return;

      const backup = {
        staff: loadLS("sunflower_staff", defaultStaff),
        students: loadLS("sunflower_students", defaultStudents),
        misc: loadLS("sunflower_misc", defaultMisc),
        studentDetails: loadLS(
          "sunflower_student_details",
          defaultStudentDetails,
        ),
        attendance: loadLS("sunflower_attendance", {}),
        exportedAt: new Date().toISOString(),
      };

      triggerDownload(
        JSON.stringify(backup, null, 2),
        `sunflower_auto_backup_${today}.json`,
      );

      localStorage.setItem("sunflower_last_backup_date", today);
      setLastBackupDate(today);

      toast.success("Daily backup saved to your Downloads folder", {
        description: `sunflower_auto_backup_${today}.json`,
        icon: <CheckCircleIcon className="w-4 h-4 text-[#00ff88]" />,
        duration: 5000,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ────────────────────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    toast.success("Generating PDF...", { duration: 1500 });
    setTimeout(() => window.print(), 400);
  }, []);

  const handleExportBackup = useCallback(() => {
    const date = getTodayDateStr();
    const backup = {
      staff,
      students,
      misc,
      studentDetails,
      attendance,
      exportedAt: new Date().toISOString(),
    };
    triggerDownload(
      JSON.stringify(backup, null, 2),
      `sunflower_backup_${date}.json`,
    );
    toast.success("Backup exported successfully!", {
      description: `Saved as sunflower_backup_${date}.json`,
      duration: 3000,
    });
  }, [staff, students, misc, studentDetails, attendance]);

  const handleImportBackup = useCallback(() => {
    importFileRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.staff) setStaff(data.staff);
          if (data.students) setStudents(data.students);
          if (data.misc) setMisc(data.misc);
          if (data.studentDetails) setStudentDetails(data.studentDetails);
          if (data.attendance) setAttendance(data.attendance);
          toast.success("Backup restored successfully!", {
            description: "All data has been loaded. Reloading page...",
            duration: 2500,
          });
          setTimeout(() => window.location.reload(), 2000);
        } catch {
          toast.error("Invalid backup file", {
            description: "Please select a valid Sunflower backup JSON file.",
            duration: 4000,
          });
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [],
  );

  const handleLock = useCallback(() => {
    sessionStorage.removeItem("sunflower_authed");
    window.location.reload();
  }, []);

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-hud scanline">
      <Toaster position="top-right" theme="dark" />

      {/* Hidden file input for import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
        data-ocid="header.backup_import_button"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl print-hide">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo + School info */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-sm bg-[#00f5ff]/10 border border-[#00f5ff]/30 flex items-center justify-center">
                  <BuildingIcon className="w-5 h-5 text-[#00f5ff]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#00ff88] rounded-full animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wider text-white cyan-glow leading-none">
                  SUNFLOWER PUBLIC SCHOOL
                </h1>
                <p className="text-xs text-[#a0a0a0] font-mono tracking-widest mt-0.5">
                  DIR: KAUSAR PARWEEN · {currentMonth.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <nav
              className="flex items-center gap-0.5 overflow-x-auto"
              role="tablist"
            >
              {TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  role="tab"
                  data-ocid={TAB_OCID[tab.id]}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium tracking-wide transition-all duration-200 relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-[#00f5ff] tab-active"
                      : "text-[#a0a0a0] hover:text-white"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f5ff]"
                      style={{ boxShadow: "0 0 8px rgba(0,245,255,0.8)" }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Action buttons */}
            <div className="shrink-0 flex items-center gap-2">
              {/* Lock button */}
              <button
                type="button"
                data-ocid="header.lock_button"
                onClick={handleLock}
                title="Lock Dashboard"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-sm bg-white/5 border border-white/10 text-[#a0a0a0] hover:bg-[#00f5ff]/10 hover:text-[#00f5ff] hover:border-[#00f5ff]/30 transition-all duration-200"
              >
                <LockIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-xs tracking-wider">
                  Lock
                </span>
              </button>

              {/* Export Backup button */}
              <button
                type="button"
                data-ocid="header.backup_export_button"
                onClick={handleExportBackup}
                title="Export JSON Backup"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-sm bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 hover:border-[#00ff88]/60 transition-all duration-200"
                style={{ boxShadow: "0 0 10px rgba(0,255,136,0.15)" }}
              >
                <DownloadIcon className="w-4 h-4" />
                <span className="hidden lg:inline text-xs tracking-wider">
                  Backup
                </span>
              </button>

              {/* Import Backup button */}
              <button
                type="button"
                onClick={handleImportBackup}
                title="Import JSON Backup"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-sm bg-[#ffaa00]/10 border border-[#ffaa00]/30 text-[#ffaa00] hover:bg-[#ffaa00]/20 hover:border-[#ffaa00]/60 transition-all duration-200"
                style={{ boxShadow: "0 0 10px rgba(255,170,0,0.15)" }}
              >
                <UploadIcon className="w-4 h-4" />
                <span className="hidden lg:inline text-xs tracking-wider">
                  Restore
                </span>
              </button>

              {/* Export PDF button */}
              <button
                type="button"
                data-ocid="header.export_button"
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-[#0066ff]/20 border border-[#0066ff]/40 text-[#6699ff] hover:bg-[#0066ff]/30 hover:text-white hover:border-[#0066ff]/70 transition-all duration-200"
                style={{ boxShadow: "0 0 12px rgba(0,102,255,0.2)" }}
              >
                <PrinterIcon className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6 print-hide">
        <AnimatePresence mode="wait">
          {activeTab === "salary" && (
            <motion.div
              key="salary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <SalaryTab staff={staff} setStaff={setStaff} />
            </motion.div>
          )}
          {activeTab === "fee" && (
            <motion.div
              key="fee"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <FeeTab
                students={students}
                setStudents={setStudents}
                studentDetails={studentDetails}
              />
            </motion.div>
          )}
          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <DetailsTab
                details={studentDetails}
                setDetails={setStudentDetails}
                students={students}
                setStudents={setStudents}
              />
            </motion.div>
          )}
          {activeTab === "misc" && (
            <motion.div
              key="misc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <MiscTab misc={misc} setMisc={setMisc} />
            </motion.div>
          )}
          {activeTab === "attendance" && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <AttendanceTab
                staff={staff}
                attendance={attendance}
                setAttendance={setAttendance}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Print-only area */}
      <PrintArea staff={staff} students={students} misc={misc} />

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 mt-8 print-hide">
        <div className="max-w-screen-2xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
              <ZapIcon className="w-3 h-3 text-[#00f5ff]" />
              <span>SUNFLOWER SCHOOL MANAGEMENT SYSTEM v1.0</span>
            </div>

            {/* Last auto-backup indicator */}
            <div
              data-ocid="footer.last_backup_info"
              className="flex items-center gap-1.5 text-xs"
            >
              <HardDriveIcon
                className="w-3 h-3"
                style={{ color: lastBackupDate ? "#00ff88" : "#555" }}
              />
              {lastBackupDate ? (
                <span className="text-[#00ff88]/80 font-mono">
                  Last auto-backup:{" "}
                  <span className="text-[#00ff88] font-semibold">
                    {formatBackupDate(lastBackupDate)}
                  </span>
                </span>
              ) : (
                <span className="text-[#555] font-mono">
                  No auto-backup yet
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[#a0a0a0]">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00f5ff] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState<boolean>(
    () => sessionStorage.getItem("sunflower_authed") === "true",
  );

  if (!authed) {
    return <LoginScreen onAuthenticated={() => setAuthed(true)} />;
  }

  return <Dashboard />;
}
