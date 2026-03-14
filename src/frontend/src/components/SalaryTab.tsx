import {
  BanknoteIcon,
  PlusIcon,
  Trash2Icon,
  TrendingDownIcon,
  UsersIcon,
} from "lucide-react";
import { useCallback } from "react";
import { INR, type Staff, calcDeduction, calcFinalSalary, fmt } from "../types";

interface Props {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="glass-card rounded-sm p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-sm flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-[#a0a0a0] tracking-widest uppercase">
          {label}
        </p>
        <p className="text-xl font-bold font-mono text-white mt-0.5">
          {INR} {value}
        </p>
      </div>
    </div>
  );
}

export default function SalaryTab({ staff, setStaff }: Props) {
  const addStaff = useCallback(() => {
    const newStaff: Staff = {
      id: Date.now().toString(),
      name: "",
      designation: "",
      baseSalary: 15000,
      totalDays: 30,
      daysPresent: 30,
      phone: "",
      address: "",
    };
    setStaff((prev) => [...prev, newStaff]);
  }, [setStaff]);

  const deleteStaff = useCallback(
    (id: string) => {
      setStaff((prev) => prev.filter((s) => s.id !== id));
    },
    [setStaff],
  );

  const updateStaff = useCallback(
    <K extends keyof Staff>(id: string, field: K, value: Staff[K]) => {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [setStaff],
  );

  const totalBase = staff.reduce((a, s) => a + s.baseSalary, 0);
  const totalFinal = staff.reduce((a, s) => a + calcFinalSalary(s), 0);
  const totalDeductions = staff.reduce((a, s) => a + calcDeduction(s), 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={UsersIcon}
          label="Total Staff"
          value={staff.length.toString()}
          color="#00f5ff"
        />
        <SummaryCard
          icon={BanknoteIcon}
          label="Total Payroll"
          value={fmt(totalFinal)}
          color="#00ff88"
        />
        <SummaryCard
          icon={TrendingDownIcon}
          label="Total Deductions"
          value={fmt(totalDeductions)}
          color="#ff4444"
        />
      </div>

      {/* Table header + add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[#a0a0a0] tracking-widest uppercase flex items-center gap-2">
          <span
            className="w-1 h-4 bg-[#00f5ff] inline-block"
            style={{ boxShadow: "0 0 8px #00f5ff" }}
          />
          Staff Salary Table
        </h2>
        <button
          type="button"
          data-ocid="salary.add_button"
          onClick={addStaff}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/20 transition-all"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Staff
        </button>
      </div>

      {/* Table */}
      <div
        className="glass-card rounded-sm overflow-x-auto"
        data-ocid="salary.table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {[
                "#",
                "Staff Name",
                "Designation",
                "Phone",
                "Address",
                `Base Salary (${INR})`,
                "Total Days",
                "Days Present",
                "Final Salary",
                "Deduction",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-xs font-medium text-[#a0a0a0] tracking-widest uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s, idx) => {
              const finalSalary = calcFinalSalary(s);
              const deduction = calcDeduction(s);
              const ocidIdx = idx + 1;
              return (
                <tr
                  key={s.id}
                  data-ocid={`salary.row.${ocidIdx}`}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-3 py-2.5 text-[#a0a0a0] font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      className="hud-input w-36 px-2 py-1 rounded-sm"
                      value={s.name}
                      placeholder="Staff Name"
                      onChange={(e) =>
                        updateStaff(s.id, "name", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      className="hud-input w-36 px-2 py-1 rounded-sm"
                      value={s.designation}
                      placeholder="Designation"
                      onChange={(e) =>
                        updateStaff(s.id, "designation", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="tel"
                      data-ocid={`salary.phone_input.${ocidIdx}`}
                      className="hud-input w-32 px-2 py-1 rounded-sm"
                      value={s.phone ?? ""}
                      placeholder="Phone No."
                      onChange={(e) =>
                        updateStaff(s.id, "phone", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      className="hud-input w-40 px-2 py-1 rounded-sm"
                      value={s.address ?? ""}
                      placeholder="Address"
                      onChange={(e) =>
                        updateStaff(s.id, "address", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      className="hud-input w-28 px-2 py-1 rounded-sm"
                      value={s.baseSalary}
                      placeholder={`${INR} Amount`}
                      onChange={(e) =>
                        updateStaff(s.id, "baseSalary", Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      className="hud-input w-20 px-2 py-1 rounded-sm"
                      value={s.totalDays}
                      onChange={(e) =>
                        updateStaff(s.id, "totalDays", Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      className="hud-input w-20 px-2 py-1 rounded-sm"
                      value={s.daysPresent}
                      onChange={(e) =>
                        updateStaff(s.id, "daysPresent", Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[#00ff88] font-medium">
                      {INR} {fmt(finalSalary)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[#ff4444] font-medium">
                      {INR} {fmt(deduction)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      data-ocid={`salary.delete_button.${ocidIdx}`}
                      onClick={() => deleteStaff(s.id)}
                      className="p-1.5 rounded-sm text-[#a0a0a0] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-all"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr className="border-t border-white/20 bg-white/[0.02]">
              <td
                colSpan={5}
                className="px-3 py-3 text-xs font-medium text-[#a0a0a0] tracking-widest uppercase"
              >
                TOTALS
              </td>
              <td className="px-3 py-3 font-mono text-white text-sm">
                {INR} {fmt(totalBase)}
              </td>
              <td colSpan={2} />
              <td className="px-3 py-3 font-mono text-[#00ff88] font-bold">
                {INR} {fmt(totalFinal)}
              </td>
              <td className="px-3 py-3 font-mono text-[#ff4444] font-bold">
                {INR} {fmt(totalDeductions)}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
        {staff.length === 0 && (
          <div
            data-ocid="salary.empty_state"
            className="py-12 text-center text-[#a0a0a0] text-sm"
          >
            No staff records. Click "Add Staff" to begin.
          </div>
        )}
      </div>

      {/* Formula note */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-sm bg-[#00f5ff]/5 border border-[#00f5ff]/15">
        <span className="text-[#00f5ff] text-xs font-mono mt-0.5">∑</span>
        <p className="text-xs text-[#a0a0a0] font-mono">
          Final Salary = (Base Salary ÷ Total Days) × Days Present &nbsp;|&nbsp;
          Deduction = Base Salary − Final Salary
        </p>
      </div>
    </div>
  );
}
