import { Toaster } from "@/components/ui/sonner";
import { BuildingIcon, PrinterIcon, ZapIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import DetailsTab from "./components/DetailsTab";
import FeeTab from "./components/FeeTab";
import MiscTab from "./components/MiscTab";
import PrintArea from "./components/PrintArea";
import SalaryTab from "./components/SalaryTab";
import type { MiscCharge, Staff, Student, StudentDetail } from "./types";

const TABS = [
  { id: "salary", label: "Salary Payroll" },
  { id: "fee", label: "Fee Ledger" },
  { id: "details", label: "Student Details" },
  { id: "misc", label: "Misc Charges" },
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

const defaultStaff: Staff[] = [
  {
    id: "1",
    name: "Muhammad Arif",
    designation: "Mathematics Teacher",
    baseSalary: 18000,
    totalDays: 30,
    daysPresent: 28,
  },
  {
    id: "2",
    name: "Fatima Zahra",
    designation: "Science Teacher",
    baseSalary: 20000,
    totalDays: 30,
    daysPresent: 30,
  },
  {
    id: "3",
    name: "Tariq Hussain",
    designation: "English Teacher",
    baseSalary: 16000,
    totalDays: 30,
    daysPresent: 25,
  },
  {
    id: "4",
    name: "Nadia Malik",
    designation: "Urdu Teacher",
    baseSalary: 14000,
    totalDays: 30,
    daysPresent: 29,
  },
  {
    id: "5",
    name: "Bilal Ahmed",
    designation: "Physical Education",
    baseSalary: 12000,
    totalDays: 30,
    daysPresent: 30,
  },
];

const defaultStudents: Student[] = [
  { id: "1", name: "Ayesha Siddiqi", grade: "Class 8-A", fees: {} },
  {
    id: "2",
    name: "Usman Farooq",
    grade: "Class 7-B",
    fees: { Jan: true, Feb: true, Mar: true },
  },
  {
    id: "3",
    name: "Zainab Raza",
    grade: "Class 9-A",
    fees: { Jan: true, Feb: true },
  },
  { id: "4", name: "Hamza Khan", grade: "Class 6-C", fees: {} },
  {
    id: "5",
    name: "Sana Bashir",
    grade: "Class 10-A",
    fees: { Jan: true, Feb: true, Mar: true, Apr: true },
  },
  { id: "6", name: "Ali Hassan", grade: "Class 8-B", fees: { Jan: true } },
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
    motherName: "Nusrat Siddiqi",
    grade: "Class 8-A",
    photo: "",
  },
  {
    id: "sd2",
    name: "Usman Farooq",
    age: "13",
    bloodGroup: "O+",
    fatherName: "Farooq Ahmed",
    motherName: "Saima Farooq",
    grade: "Class 7-B",
    photo: "",
  },
  {
    id: "sd3",
    name: "Zainab Raza",
    age: "15",
    bloodGroup: "A+",
    fatherName: "Raza Khan",
    motherName: "Hina Raza",
    grade: "Class 9-A",
    photo: "",
  },
  {
    id: "sd4",
    name: "Sana Bashir",
    age: "16",
    bloodGroup: "AB+",
    fatherName: "Bashir Ahmad",
    motherName: "Rukhsana Bashir",
    grade: "Class 10-A",
    photo: "",
  },
];

const TAB_OCID: Record<TabId, string> = {
  salary: "header.salary_tab",
  fee: "header.fee_tab",
  details: "header.details_tab",
  misc: "header.misc_tab",
};

export default function App() {
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
  const [feeAmount, setFeeAmount] = useState<number>(() =>
    loadLS("sunflower_fee_amount", 500),
  );
  const [studentDetails, setStudentDetails] = useState<StudentDetail[]>(() =>
    loadLS("sunflower_student_details", defaultStudentDetails),
  );

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
    localStorage.setItem("sunflower_fee_amount", JSON.stringify(feeAmount));
  }, [feeAmount]);
  useEffect(() => {
    localStorage.setItem(
      "sunflower_student_details",
      JSON.stringify(studentDetails),
    );
  }, [studentDetails]);

  const handleExport = useCallback(() => {
    toast.success("Generating PDF...", { duration: 1500 });
    setTimeout(() => window.print(), 400);
  }, []);

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-hud scanline">
      <Toaster position="top-right" theme="dark" />

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

            {/* Export button */}
            <button
              type="button"
              data-ocid="header.export_button"
              onClick={handleExport}
              className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-[#0066ff]/20 border border-[#0066ff]/40 text-[#6699ff] hover:bg-[#0066ff]/30 hover:text-white hover:border-[#0066ff]/70 transition-all duration-200"
              style={{ boxShadow: "0 0 12px rgba(0,102,255,0.2)" }}
            >
              <PrinterIcon className="w-4 h-4" />
              Export PDF
            </button>
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
                feeAmount={feeAmount}
                setFeeAmount={setFeeAmount}
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
        </AnimatePresence>
      </main>

      {/* Print-only area */}
      <PrintArea
        staff={staff}
        students={students}
        misc={misc}
        feeAmount={feeAmount}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 mt-8 print-hide">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
            <ZapIcon className="w-3 h-3 text-[#00f5ff]" />
            <span>SUNFLOWER SCHOOL MANAGEMENT SYSTEM v1.0</span>
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
