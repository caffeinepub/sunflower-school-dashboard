import { PlusIcon, ReceiptIcon, Trash2Icon } from "lucide-react";
import { useCallback } from "react";
import { INR, type MiscCategory, type MiscCharge, fmt } from "../types";

interface Props {
  misc: MiscCharge[];
  setMisc: React.Dispatch<React.SetStateAction<MiscCharge[]>>;
}

const CATEGORIES: MiscCategory[] = ["Uniforms", "Books", "Exam Fee", "Other"];

const CAT_COLORS: Record<MiscCategory, string> = {
  Uniforms: "#00f5ff",
  Books: "#0066ff",
  "Exam Fee": "#b06aff",
  Other: "#a0a0a0",
};

export default function MiscTab({ misc, setMisc }: Props) {
  const addCharge = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const newCharge: MiscCharge = {
      id: Date.now().toString(),
      description: "",
      category: "Other",
      amount: 0,
      date: today,
    };
    setMisc((prev) => [...prev, newCharge]);
  }, [setMisc]);

  const deleteCharge = useCallback(
    (id: string) => {
      setMisc((prev) => prev.filter((c) => c.id !== id));
    },
    [setMisc],
  );

  const updateCharge = useCallback(
    <K extends keyof MiscCharge>(
      id: string,
      field: K,
      value: MiscCharge[K],
    ) => {
      setMisc((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      );
    },
    [setMisc],
  );

  const total = misc.reduce((a, c) => a + c.amount, 0);
  const byCategory = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = misc
      .filter((c) => c.category === cat)
      .reduce((a, c) => a + c.amount, 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="col-span-2 sm:col-span-1 glass-card rounded-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <ReceiptIcon className="w-4 h-4 text-[#00f5ff]" />
            <span className="text-xs text-[#a0a0a0] tracking-widest uppercase">
              Total
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-white">
            {INR} {fmt(total)}
          </p>
          <p className="text-xs text-[#a0a0a0] mt-1">{misc.length} entries</p>
        </div>
        {CATEGORIES.map((cat) => (
          <div key={cat} className="glass-card rounded-sm p-3">
            <p
              className="text-xs text-[#a0a0a0] tracking-wider mb-1"
              style={{ color: CAT_COLORS[cat] }}
            >
              {cat}
            </p>
            <p className="font-mono font-bold text-white text-sm">
              {INR} {fmt(byCategory[cat] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[#a0a0a0] tracking-widest uppercase flex items-center gap-2">
          <span
            className="w-1 h-4 bg-[#b06aff] inline-block"
            style={{ boxShadow: "0 0 8px #b06aff" }}
          />
          Miscellaneous Charges Log
        </h2>
        <button
          type="button"
          data-ocid="misc.add_button"
          onClick={addCharge}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/20 transition-all"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Charge
        </button>
      </div>

      {/* Table */}
      <div
        className="glass-card rounded-sm overflow-x-auto"
        data-ocid="misc.table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {[
                "#",
                "Description",
                "Category",
                `Amount (${INR})`,
                "Date",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-xs font-medium text-[#a0a0a0] tracking-widest uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {misc.map((c, idx) => {
              const ocidIdx = idx + 1;
              return (
                <tr
                  key={c.id}
                  data-ocid={`misc.row.${ocidIdx}`}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-3 py-2.5 text-[#a0a0a0] font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      className="hud-input w-48 px-2 py-1 rounded-sm"
                      value={c.description}
                      placeholder="Description"
                      onChange={(e) =>
                        updateCharge(c.id, "description", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      className="hud-input px-2 py-1 rounded-sm cursor-pointer"
                      value={c.category}
                      onChange={(e) =>
                        updateCharge(
                          c.id,
                          "category",
                          e.target.value as MiscCategory,
                        )
                      }
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#141414]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      className="hud-input w-28 px-2 py-1 rounded-sm"
                      value={c.amount}
                      placeholder={`${INR} Amount`}
                      onChange={(e) =>
                        updateCharge(c.id, "amount", Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="date"
                      className="hud-input px-2 py-1 rounded-sm"
                      value={c.date}
                      onChange={(e) =>
                        updateCharge(c.id, "date", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      data-ocid={`misc.delete_button.${ocidIdx}`}
                      onClick={() => deleteCharge(c.id)}
                      className="p-1.5 rounded-sm text-[#a0a0a0] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-all"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {misc.length === 0 && (
          <div
            data-ocid="misc.empty_state"
            className="py-12 text-center text-[#a0a0a0] text-sm"
          >
            No charges logged. Click "Add Charge" to begin.
          </div>
        )}
      </div>
    </div>
  );
}
