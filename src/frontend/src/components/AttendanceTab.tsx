import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClockIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type {
  AttendanceRecord,
  AttendanceStatus,
  ReportingTimesRecord,
  Staff,
} from "../types";

interface Props {
  staff: Staff[];
  attendance: AttendanceRecord;
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord>>;
  reportingTimes: ReportingTimesRecord;
  setReportingTimes: React.Dispatch<React.SetStateAction<ReportingTimesRecord>>;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STANDARD_TIME = "09:00";

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTodayKey(): string {
  const t = new Date();
  return formatDateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

function isLate(time: string): boolean {
  if (!time) return false;
  return time > STANDARD_TIME;
}

function formatTime12h(time: string): string {
  if (!time) return "\u2014";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getCurrentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

const STATUS_CONFIG = {
  present: {
    label: "Present",
    color: "#00ff88",
    bg: "rgba(0,255,136,0.15)",
    border: "rgba(0,255,136,0.4)",
    icon: "\u2713",
  },
  absent: {
    label: "Absent",
    color: "#ff4444",
    bg: "rgba(255,68,68,0.15)",
    border: "rgba(255,68,68,0.4)",
    icon: "\u2717",
  },
  leave: {
    label: "Leave",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.4)",
    icon: "L",
  },
};

function StatusDot({ status }: { status: AttendanceStatus | undefined }) {
  if (!status)
    return (
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: "#3a3a3a" }}
      />
    );
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}80` }}
    />
  );
}

export default function AttendanceTab({
  staff,
  attendance,
  setAttendance,
  reportingTimes,
  setReportingTimes,
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate(),
  );
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [timingOpen, setTimingOpen] = useState(true);

  const todayKey = getTodayKey();
  const todayAttendance = attendance[todayKey];
  const todayMarked =
    todayAttendance && staff.length > 0
      ? Object.keys(todayAttendance).length > 0
      : false;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }

  function isFutureDate(day: number): boolean {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d > t;
  }

  function isSunday(day: number): boolean {
    return new Date(viewYear, viewMonth, day).getDay() === 0;
  }

  function isToday(day: number): boolean {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  }

  function getDateKey(day: number): string {
    return formatDateKey(viewYear, viewMonth, day);
  }

  function markStatus(staffId: string, day: number, status: AttendanceStatus) {
    const key = getDateKey(day);
    setAttendance((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [staffId]: status },
    }));
    // Auto-fill current time when marking Present (only if no time already logged)
    if (status === "present") {
      setReportingTimes((prev) => {
        if (prev[key]?.[staffId]) return prev;
        return {
          ...prev,
          [key]: { ...(prev[key] ?? {}), [staffId]: getCurrentTimeString() },
        };
      });
    }
  }

  function markAllPresent(day: number) {
    const key = getDateKey(day);
    const daily: Record<string, AttendanceStatus> = {};
    for (const s of staff) daily[s.id] = "present";
    setAttendance((prev) => ({ ...prev, [key]: daily }));
    // Auto-fill current time for all staff without an existing time
    const currentTime = getCurrentTimeString();
    setReportingTimes((prev) => {
      const existing = prev[key] ?? {};
      const updated = { ...existing };
      for (const s of staff) {
        if (!updated[s.id]) updated[s.id] = currentTime;
      }
      return { ...prev, [key]: updated };
    });
  }

  function setReportingTime(staffId: string, day: number, time: string) {
    const key = getDateKey(day);
    setReportingTimes((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [staffId]: time },
    }));
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: isSunday is stable given viewYear/viewMonth in deps
  const summary = useMemo(() => {
    return staff.map((s) => {
      let present = 0;
      let absent = 0;
      let leave = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        if (isSunday(d)) continue;
        const key = formatDateKey(viewYear, viewMonth, d);
        const st = attendance[key]?.[s.id];
        if (st === "present") present++;
        else if (st === "absent") absent++;
        else if (st === "leave") leave++;
      }
      const workingDays = Array.from(
        { length: daysInMonth },
        (_, i) => i + 1,
      ).filter((d) => !isSunday(d)).length;
      const pct =
        workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
      return { staff: s, present, absent, leave, pct };
    });
  }, [staff, attendance, viewYear, viewMonth, daysInMonth]);

  const selectedDateKey = selectedDay ? getDateKey(selectedDay) : null;
  const selectedDailyAttendance = selectedDateKey
    ? (attendance[selectedDateKey] ?? {})
    : {};
  const selectedDailyTimes = selectedDateKey
    ? (reportingTimes[selectedDateKey] ?? {})
    : {};

  const panelStats = selectedDay
    ? {
        present: staff.filter(
          (s) => selectedDailyAttendance[s.id] === "present",
        ).length,
        absent: staff.filter((s) => selectedDailyAttendance[s.id] === "absent")
          .length,
        leave: staff.filter((s) => selectedDailyAttendance[s.id] === "leave")
          .length,
      }
    : null;

  const selectedDayLabel = selectedDay
    ? new Date(viewYear, viewMonth, selectedDay).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const selectedFuture = selectedDay ? isFutureDate(selectedDay) : false;

  const lateCount = selectedDay
    ? staff.filter((s) => isLate(selectedDailyTimes[s.id] ?? "")).length
    : 0;
  const onTimeCount = selectedDay
    ? staff.filter((s) => {
        const t = selectedDailyTimes[s.id];
        return t && !isLate(t);
      }).length
    : 0;

  return (
    <div className="space-y-4">
      {/* Today Quick-Mark Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-card rounded-sm p-4 flex items-center justify-between gap-4"
        style={{
          borderColor: todayMarked
            ? "rgba(0,255,136,0.3)"
            : "rgba(0,245,255,0.3)",
          boxShadow: todayMarked
            ? "0 0 20px rgba(0,255,136,0.08)"
            : "0 0 20px rgba(0,245,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-sm flex items-center justify-center"
            style={{
              background: todayMarked
                ? "rgba(0,255,136,0.12)"
                : "rgba(0,245,255,0.1)",
              border: `1px solid ${todayMarked ? "rgba(0,255,136,0.3)" : "rgba(0,245,255,0.3)"}`,
            }}
          >
            {todayMarked ? (
              <CheckCircle2Icon
                className="w-5 h-5"
                style={{ color: "#00ff88" }}
              />
            ) : (
              <ClockIcon className="w-5 h-5" style={{ color: "#00f5ff" }} />
            )}
          </div>
          <div>
            <p
              className="text-sm font-semibold tracking-wide"
              style={{ color: todayMarked ? "#00ff88" : "#00f5ff" }}
            >
              {todayMarked
                ? "Today's Attendance Done \u2713"
                : "Today's Attendance Not Marked"}
            </p>
            <p className="text-xs" style={{ color: "#a0a0a0" }}>
              {today.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        {!todayMarked && (
          <button
            type="button"
            data-ocid="attendance.today_mark_button"
            onClick={() => {
              setViewYear(today.getFullYear());
              setViewMonth(today.getMonth());
              setSelectedDay(today.getDate());
            }}
            className="shrink-0 px-4 py-2 text-sm font-medium rounded-sm tracking-wider transition-all"
            style={{
              background: "rgba(0,245,255,0.15)",
              border: "1px solid rgba(0,245,255,0.4)",
              color: "#00f5ff",
            }}
          >
            Mark Now
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="xl:col-span-2 glass-card rounded-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              data-ocid="attendance.prev_month_button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#a0a0a0",
              }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" style={{ color: "#00f5ff" }} />
              <h2
                className="text-base font-bold tracking-widest"
                style={{
                  color: "#00f5ff",
                  textShadow: "0 0 10px rgba(0,245,255,0.4)",
                }}
              >
                {monthName.toUpperCase()}
              </h2>
            </div>
            <button
              type="button"
              data-ocid="attendance.next_month_button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#a0a0a0",
              }}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-mono py-1 tracking-widest"
                style={{
                  color: d === "Sun" ? "rgba(255,68,68,0.5)" : "#a0a0a0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              // biome-ignore lint/suspicious/noArrayIndexKey: empty calendar spacer cells have no natural key
              if (!day) return <div key={`empty-${idx}`} />;
              const key = getDateKey(day);
              const daily = attendance[key] ?? {};
              const future = isFutureDate(day);
              const sunday = isSunday(day);
              const todayCell = isToday(day);
              const selected = selectedDay === day;
              return (
                <button
                  type="button"
                  key={`day-${day}`}
                  data-ocid={`attendance.day_cell.${day}`}
                  onClick={() =>
                    setSelectedDay(day === selectedDay ? null : day)
                  }
                  disabled={sunday}
                  className="relative rounded-sm p-1.5 min-h-[60px] flex flex-col items-start transition-all text-left group"
                  style={{
                    background: selected
                      ? "rgba(0,245,255,0.12)"
                      : sunday
                        ? "rgba(255,255,255,0.01)"
                        : future
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(255,255,255,0.04)",
                    border: todayCell
                      ? "1px solid rgba(0,245,255,0.6)"
                      : selected
                        ? "1px solid rgba(0,245,255,0.3)"
                        : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: todayCell
                      ? "0 0 12px rgba(0,245,255,0.2)"
                      : selected
                        ? "0 0 8px rgba(0,245,255,0.1)"
                        : "none",
                    opacity: sunday ? 0.3 : future ? 0.45 : 1,
                    cursor: sunday ? "not-allowed" : "pointer",
                  }}
                >
                  <span
                    className="text-xs font-mono leading-none mb-1.5"
                    style={{
                      color: todayCell
                        ? "#00f5ff"
                        : sunday
                          ? "#ff4444"
                          : "#ffffff",
                      fontWeight: todayCell ? 700 : 400,
                      textShadow: todayCell
                        ? "0 0 8px rgba(0,245,255,0.6)"
                        : "none",
                    }}
                  >
                    {day}
                  </span>
                  {!sunday && !future && staff.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {staff.slice(0, 6).map((s) => (
                        <StatusDot
                          key={s.id}
                          status={daily[s.id] as AttendanceStatus | undefined}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="flex items-center gap-4 pt-2 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {Object.entries(STATUS_CONFIG).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: cfg.color,
                    boxShadow: `0 0 4px ${cfg.color}80`,
                  }}
                />
                <span className="text-xs" style={{ color: "#a0a0a0" }}>
                  {cfg.label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#3a3a3a" }}
              />
              <span className="text-xs" style={{ color: "#a0a0a0" }}>
                Unmarked
              </span>
            </div>
          </div>
        </div>

        {/* Day Attendance Panel */}
        <div className="glass-card rounded-sm p-4">
          {selectedDay ? (
            <div className="space-y-4">
              <div>
                <p
                  className="text-xs font-mono tracking-widest"
                  style={{ color: "#a0a0a0" }}
                >
                  ATTENDANCE FOR
                </p>
                <h3
                  className="text-sm font-semibold mt-0.5 leading-snug"
                  style={{ color: "#00f5ff" }}
                >
                  {selectedDayLabel}
                </h3>
              </div>

              {selectedFuture ? (
                <div
                  className="rounded-sm p-4 text-center text-sm"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#a0a0a0",
                  }}
                >
                  Future date — cannot mark attendance
                </div>
              ) : (
                <>
                  {panelStats && (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: "Present",
                          val: panelStats.present,
                          color: "#00ff88",
                        },
                        {
                          label: "Absent",
                          val: panelStats.absent,
                          color: "#ff4444",
                        },
                        {
                          label: "Leave",
                          val: panelStats.leave,
                          color: "#f59e0b",
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-sm p-2 text-center"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <p
                            className="text-lg font-bold font-mono"
                            style={{ color: stat.color }}
                          >
                            {stat.val}
                          </p>
                          <p className="text-xs" style={{ color: "#a0a0a0" }}>
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    data-ocid="attendance.mark_all_present_button"
                    onClick={() => markAllPresent(selectedDay)}
                    className="w-full py-2 text-sm font-medium rounded-sm tracking-wide transition-all"
                    style={{
                      background: "rgba(0,255,136,0.12)",
                      border: "1px solid rgba(0,255,136,0.3)",
                      color: "#00ff88",
                    }}
                  >
                    \u2713 Mark All Present
                  </button>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {staff.length === 0 ? (
                      <p
                        className="text-xs text-center py-4"
                        style={{ color: "#a0a0a0" }}
                      >
                        No staff added yet.
                      </p>
                    ) : (
                      staff.map((s, idx) => {
                        const status = selectedDailyAttendance[s.id] as
                          | AttendanceStatus
                          | undefined;
                        return (
                          <div
                            key={s.id}
                            className="rounded-sm p-2.5 space-y-2"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold font-mono"
                                style={{
                                  background: "rgba(0,245,255,0.08)",
                                  color: "#00f5ff",
                                  border: "1px solid rgba(0,245,255,0.2)",
                                }}
                              >
                                {s.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-xs font-semibold truncate"
                                  style={{ color: "white" }}
                                >
                                  {s.name}
                                </p>
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "#a0a0a0" }}
                                >
                                  {s.designation}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              {(
                                [
                                  "present",
                                  "absent",
                                  "leave",
                                ] as AttendanceStatus[]
                              ).map((st) => {
                                const cfg = STATUS_CONFIG[st];
                                const active = status === st;
                                const ocidMap: Record<
                                  AttendanceStatus,
                                  string
                                > = {
                                  present: `attendance.present_button.${idx + 1}`,
                                  absent: `attendance.absent_button.${idx + 1}`,
                                  leave: `attendance.leave_button.${idx + 1}`,
                                };
                                return (
                                  <button
                                    type="button"
                                    key={st}
                                    data-ocid={ocidMap[st]}
                                    onClick={() =>
                                      markStatus(s.id, selectedDay, st)
                                    }
                                    className="flex-1 py-1 text-xs font-medium rounded-sm transition-all"
                                    style={{
                                      background: active
                                        ? cfg.bg
                                        : "rgba(255,255,255,0.04)",
                                      border: active
                                        ? `1px solid ${cfg.border}`
                                        : "1px solid rgba(255,255,255,0.07)",
                                      color: active ? cfg.color : "#a0a0a0",
                                      boxShadow: active
                                        ? `0 0 8px ${cfg.color}30`
                                        : "none",
                                    }}
                                  >
                                    {cfg.icon} {cfg.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
              <UsersIcon
                className="w-8 h-8"
                style={{ color: "rgba(0,245,255,0.3)" }}
              />
              <p className="text-sm text-center" style={{ color: "#a0a0a0" }}>
                Click a day on the calendar to mark attendance
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Reporting Timing Section */}
      <div className="glass-card rounded-sm">
        <button
          type="button"
          data-ocid="attendance.timing_section_toggle"
          onClick={() => setTimingOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 transition-all"
          style={{
            borderBottom: timingOpen
              ? "1px solid rgba(255,255,255,0.08)"
              : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <TimerIcon className="w-4 h-4" style={{ color: "#f59e0b" }} />
            <span
              className="text-sm font-medium tracking-wide"
              style={{ color: "white" }}
            >
              Teacher Reporting Timing
            </span>
            {selectedDay && !selectedFuture && (
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-sm"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "#f59e0b",
                }}
              >
                {selectedDayLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedDay && !selectedFuture && staff.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-mono">
                {onTimeCount > 0 && (
                  <span style={{ color: "#00ff88" }}>
                    {onTimeCount} On Time
                  </span>
                )}
                {lateCount > 0 && (
                  <span style={{ color: "#ff4444" }}>{lateCount} Late</span>
                )}
              </div>
            )}
            {timingOpen ? (
              <ChevronUpIcon className="w-4 h-4" style={{ color: "#a0a0a0" }} />
            ) : (
              <ChevronDownIcon
                className="w-4 h-4"
                style={{ color: "#a0a0a0" }}
              />
            )}
          </div>
        </button>

        <AnimatePresence>
          {timingOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="p-4 space-y-4">
                <div
                  className="flex items-center gap-2 p-3 rounded-sm text-xs"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    color: "#a0a0a0",
                  }}
                >
                  <ClockIcon
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "#f59e0b" }}
                  />
                  <span>
                    Standard reporting time:{" "}
                    <span
                      className="font-mono font-semibold"
                      style={{ color: "#f59e0b" }}
                    >
                      09:00 AM
                    </span>
                    . Arrivals after 9:00 AM are marked as{" "}
                    <span style={{ color: "#ff4444" }}>Late</span>. Time is
                    auto-filled when marking Present.
                  </span>
                </div>

                {!selectedDay ? (
                  <p
                    className="text-xs text-center py-4"
                    style={{ color: "#a0a0a0" }}
                  >
                    Select a day on the calendar above to log reporting times.
                  </p>
                ) : selectedFuture ? (
                  <p
                    className="text-xs text-center py-4"
                    style={{ color: "#a0a0a0" }}
                  >
                    Future date — cannot log reporting times.
                  </p>
                ) : staff.length === 0 ? (
                  <p
                    className="text-xs text-center py-4"
                    style={{ color: "#a0a0a0" }}
                  >
                    No staff added yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table
                      data-ocid="attendance.reporting_timing_table"
                      className="w-full text-sm border-collapse"
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {[
                            "#",
                            "Teacher",
                            "Designation",
                            "Arrival Time",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-mono tracking-widest"
                              style={{ color: "#a0a0a0" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((s, idx) => {
                          const time = selectedDailyTimes[s.id] ?? "";
                          const late = isLate(time);
                          return (
                            <tr
                              key={s.id}
                              style={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <td
                                className="px-3 py-2.5 text-xs font-mono"
                                style={{ color: "#555" }}
                              >
                                {idx + 1}
                              </td>
                              <td
                                className="px-3 py-2.5 font-medium"
                                style={{ color: "white" }}
                              >
                                {s.name}
                              </td>
                              <td
                                className="px-3 py-2.5 text-xs"
                                style={{ color: "#a0a0a0" }}
                              >
                                {s.designation}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="time"
                                  data-ocid={`attendance.reporting_time_input.${idx + 1}`}
                                  value={time}
                                  onChange={(e) =>
                                    setReportingTime(
                                      s.id,
                                      selectedDay,
                                      e.target.value,
                                    )
                                  }
                                  className="rounded-sm px-2 py-1 text-xs font-mono outline-none transition-all"
                                  style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: time
                                      ? late
                                        ? "1px solid rgba(255,68,68,0.5)"
                                        : "1px solid rgba(0,255,136,0.4)"
                                      : "1px solid rgba(255,255,255,0.12)",
                                    color: time
                                      ? late
                                        ? "#ff6666"
                                        : "#00ff88"
                                      : "#a0a0a0",
                                    colorScheme: "dark",
                                  }}
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                {time ? (
                                  <span
                                    className="px-2 py-0.5 rounded-sm text-xs font-mono font-semibold"
                                    style={{
                                      background: late
                                        ? "rgba(255,68,68,0.12)"
                                        : "rgba(0,255,136,0.12)",
                                      border: late
                                        ? "1px solid rgba(255,68,68,0.3)"
                                        : "1px solid rgba(0,255,136,0.3)",
                                      color: late ? "#ff4444" : "#00ff88",
                                    }}
                                  >
                                    {late
                                      ? `Late \u00b7 ${formatTime12h(time)}`
                                      : `On Time \u00b7 ${formatTime12h(time)}`}
                                  </span>
                                ) : (
                                  <span
                                    className="text-xs"
                                    style={{ color: "#555" }}
                                  >
                                    Not logged
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Monthly Summary */}
      <div className="glass-card rounded-sm">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 transition-all"
          style={{
            borderBottom: summaryOpen
              ? "1px solid rgba(255,255,255,0.08)"
              : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4" style={{ color: "#00f5ff" }} />
            <span
              className="text-sm font-medium tracking-wide"
              style={{ color: "white" }}
            >
              Monthly Summary \u2014 {monthName}
            </span>
          </div>
          {summaryOpen ? (
            <ChevronUpIcon className="w-4 h-4" style={{ color: "#a0a0a0" }} />
          ) : (
            <ChevronDownIcon className="w-4 h-4" style={{ color: "#a0a0a0" }} />
          )}
        </button>

        <AnimatePresence>
          {summaryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="p-4 overflow-x-auto">
                <table
                  data-ocid="attendance.summary_table"
                  className="w-full text-sm border-collapse"
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {[
                        "Staff Member",
                        "Designation",
                        "Present",
                        "Absent",
                        "Leave",
                        "Attendance %",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-mono tracking-widest"
                          style={{ color: "#a0a0a0" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center text-xs"
                          style={{ color: "#a0a0a0" }}
                        >
                          No staff added yet.
                        </td>
                      </tr>
                    ) : (
                      summary.map(
                        ({ staff: s, present, absent, leave, pct }) => (
                          <tr
                            key={s.id}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <td
                              className="px-3 py-2.5 font-medium"
                              style={{ color: "white" }}
                            >
                              {s.name}
                            </td>
                            <td
                              className="px-3 py-2.5 text-xs"
                              style={{ color: "#a0a0a0" }}
                            >
                              {s.designation}
                            </td>
                            <td
                              className="px-3 py-2.5 font-mono text-center"
                              style={{ color: "#00ff88" }}
                            >
                              {present}
                            </td>
                            <td
                              className="px-3 py-2.5 font-mono text-center"
                              style={{ color: "#ff4444" }}
                            >
                              {absent}
                            </td>
                            <td
                              className="px-3 py-2.5 font-mono text-center"
                              style={{ color: "#f59e0b" }}
                            >
                              {leave}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className="px-2 py-0.5 rounded-sm text-xs font-mono font-bold"
                                style={{
                                  background:
                                    pct >= 90
                                      ? "rgba(0,255,136,0.15)"
                                      : pct >= 75
                                        ? "rgba(245,158,11,0.15)"
                                        : "rgba(255,68,68,0.15)",
                                  color:
                                    pct >= 90
                                      ? "#00ff88"
                                      : pct >= 75
                                        ? "#f59e0b"
                                        : "#ff4444",
                                  border:
                                    pct >= 90
                                      ? "1px solid rgba(0,255,136,0.3)"
                                      : pct >= 75
                                        ? "1px solid rgba(245,158,11,0.3)"
                                        : "1px solid rgba(255,68,68,0.3)",
                                }}
                              >
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
