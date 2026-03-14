import {
  INR,
  MONTHS,
  type MiscCharge,
  type Staff,
  type Student,
  calcDeduction,
  calcFinalSalary,
  fmt,
} from "../types";

interface Props {
  staff: Staff[];
  students: Student[];
  misc: MiscCharge[];
}

export default function PrintArea({ staff, students, misc }: Props) {
  const now = new Date();
  const monthYear = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const totalPayroll = staff.reduce((a, s) => a + calcFinalSalary(s), 0);
  const totalDeductions = staff.reduce((a, s) => a + calcDeduction(s), 0);
  const totalMisc = misc.reduce((a, c) => a + c.amount, 0);

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

  return (
    <div id="print-area" style={{ display: "none" }}>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          color: "#000",
          background: "#fff",
          padding: "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
            borderBottom: "2px solid #000",
            paddingBottom: "16px",
          }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>
            SUNFLOWER PUBLIC SCHOOL
          </h1>
          <p style={{ margin: "4px 0", fontSize: "13px" }}>
            Director: Kausar Parween
          </p>
          <p style={{ margin: "4px 0", fontSize: "13px", fontWeight: "bold" }}>
            Monthly Report — {monthYear}
          </p>
          <p style={{ margin: "4px 0", fontSize: "11px", color: "#666" }}>
            Generated: {now.toLocaleDateString()} {now.toLocaleTimeString()}
          </p>
        </div>

        {/* Salary Section */}
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "10px",
            borderLeft: "3px solid #000",
            paddingLeft: "8px",
          }}
        >
          Staff Salary Payroll
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              {[
                "#",
                "Name",
                "Designation",
                `Base Salary (${INR})`,
                "Days Present",
                `Final Salary (${INR})`,
                `Deduction (${INR})`,
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    border: "1px solid #ccc",
                    padding: "6px 8px",
                    textAlign: "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={s.id}>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {i + 1}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {s.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {s.designation}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {INR} {fmt(s.baseSalary)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {s.daysPresent}/{s.totalDays}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px 8px",
                    fontWeight: "bold",
                  }}
                >
                  {INR} {fmt(calcFinalSalary(s))}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {INR} {fmt(calcDeduction(s))}
                </td>
              </tr>
            ))}
            <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
              <td
                colSpan={5}
                style={{ border: "1px solid #ccc", padding: "5px 8px" }}
              >
                TOTAL
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                {INR} {fmt(totalPayroll)}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                {INR} {fmt(totalDeductions)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Fee Section */}
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "10px",
            borderLeft: "3px solid #000",
            paddingLeft: "8px",
          }}
        >
          Student Fee Ledger
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "11px",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              {[
                "#",
                "Name",
                "Class",
                "Tuition/mo",
                "Gen/mo",
                "Transport/mo",
                ...MONTHS,
                `Total Paid (${INR})`,
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px 4px",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px 6px",
                    textAlign: "center",
                  }}
                >
                  {i + 1}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px 6px" }}>
                  {s.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px 6px" }}>
                  {s.grade}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px 6px",
                    textAlign: "right",
                  }}
                >
                  {INR}
                  {fmt(s.classFee)}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px 6px",
                    textAlign: "right",
                  }}
                >
                  {s.generatorCharge > 0
                    ? `${INR}${fmt(s.generatorCharge)}`
                    : "—"}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px 6px",
                    textAlign: "right",
                  }}
                >
                  {s.transportCharge > 0
                    ? `${INR}${fmt(s.transportCharge)}`
                    : "—"}
                </td>
                {MONTHS.map((m) => (
                  <td
                    key={m}
                    style={{
                      border: "1px solid #ccc",
                      padding: "3px 2px",
                      textAlign: "center",
                      background: s.fees[m] ? "#d4edda" : "#f8d7da",
                      fontSize: "9px",
                    }}
                  >
                    {s.fees[m] ? "T✓" : "T✗"}
                    {s.generatorCharge > 0 && (
                      <span
                        style={{
                          display: "block",
                          color: s.generatorFees[m] ? "#856404" : "#999",
                        }}
                      >
                        {s.generatorFees[m] ? "G✓" : "G✗"}
                      </span>
                    )}
                    {s.transportCharge > 0 && (
                      <span
                        style={{
                          display: "block",
                          color: s.transportFees[m] ? "#0c5460" : "#999",
                        }}
                      >
                        {s.transportFees[m] ? "Tr✓" : "Tr✗"}
                      </span>
                    )}
                  </td>
                ))}
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px 6px",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  {INR} {fmt(studentTotalPaid(s))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Misc Section */}
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "10px",
            borderLeft: "3px solid #000",
            paddingLeft: "8px",
          }}
        >
          Miscellaneous Charges
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              {["#", "Description", "Category", `Amount (${INR})`, "Date"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 8px",
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {misc.map((c, i) => (
              <tr key={c.id}>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {i + 1}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {c.description}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {c.category}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {INR} {fmt(c.amount)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                  {c.date}
                </td>
              </tr>
            ))}
            <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
              <td
                colSpan={3}
                style={{ border: "1px solid #ccc", padding: "5px 8px" }}
              >
                TOTAL MISC CHARGES
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px" }}>
                {INR} {fmt(totalMisc)}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px 8px" }} />
            </tr>
          </tbody>
        </table>

        <div
          style={{
            borderTop: "1px solid #ccc",
            paddingTop: "12px",
            fontSize: "11px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Sunflower Public School — Official Monthly Report — {monthYear}
        </div>
      </div>
    </div>
  );
}
