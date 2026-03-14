import {
  CameraIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UserCircleIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useId, useRef, useState } from "react";
import { BLOOD_GROUPS, type BloodGroup, type StudentDetail } from "../types";

interface Props {
  details: StudentDetail[];
  setDetails: React.Dispatch<React.SetStateAction<StudentDetail[]>>;
}

const EMPTY_FORM: Omit<StudentDetail, "id"> = {
  name: "",
  age: "",
  bloodGroup: "A+",
  fatherName: "",
  motherName: "",
  grade: "",
  photo: "",
};

function BloodBadge({ group }: { group: BloodGroup }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono font-bold"
      style={{
        background: "rgba(255,68,68,0.12)",
        border: "1px solid rgba(255,68,68,0.3)",
        color: "#ff6b6b",
      }}
    >
      {group}
    </span>
  );
}

function StudentCard({
  student,
  idx,
  onEdit,
  onDelete,
  onPhotoUpload,
}: {
  student: StudentDetail;
  idx: number;
  onEdit: (s: StudentDetail) => void;
  onDelete: (id: string) => void;
  onPhotoUpload: (id: string, dataUrl: string) => void;
}) {
  const fileInputId = `photo-card-${student.id}`;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") onPhotoUpload(student.id, result);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [student.id, onPhotoUpload],
  );

  const ocidIdx = idx + 1;

  return (
    <motion.div
      data-ocid={`details.card.${ocidIdx}`}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.18 }}
      className="glass-card rounded-sm p-4 flex flex-col gap-4 relative group"
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          data-ocid={`details.edit_button.${ocidIdx}`}
          onClick={() => onEdit(student)}
          className="p-1.5 rounded-sm text-[#a0a0a0] hover:text-[#00f5ff] hover:bg-[#00f5ff]/10 transition-all"
          title="Edit"
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          data-ocid={`details.delete_button.${ocidIdx}`}
          onClick={() => onDelete(student.id)}
          className="p-1.5 rounded-sm text-[#a0a0a0] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-all"
          title="Delete"
        >
          <Trash2Icon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Photo + name row */}
      <div className="flex items-center gap-3">
        {/* Avatar — use label wrapping input for accessible file pick */}
        <div className="relative shrink-0">
          <label
            htmlFor={fileInputId}
            className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white/5 cursor-pointer block"
            style={{ borderColor: "rgba(0,245,255,0.25)" }}
            title="Click to upload photo"
          >
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-10 h-10 text-[#a0a0a0]" />
            )}
          </label>
          {/* Camera badge — also a label for the same input */}
          <label
            htmlFor={fileInputId}
            data-ocid={`details.photo_upload.${ocidIdx}`}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00f5ff]/20 border border-[#00f5ff]/40 flex items-center justify-center hover:bg-[#00f5ff]/30 transition-all cursor-pointer"
            title="Upload photo"
          >
            <CameraIcon className="w-2.5 h-2.5 text-[#00f5ff]" />
          </label>
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {/* Name + grade */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">
            {student.name || (
              <span className="text-[#a0a0a0] italic">Unnamed</span>
            )}
          </p>
          <p className="text-xs text-[#a0a0a0] mt-0.5">
            {student.grade || "—"}
          </p>
          <div className="mt-1.5">
            <BloodBadge group={student.bloodGroup} />
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-white/5 pt-3">
        <div>
          <p className="text-[#a0a0a0] tracking-wider uppercase text-[10px] mb-0.5">
            Age
          </p>
          <p className="text-white font-mono">{student.age || "—"}</p>
        </div>
        <div>
          <p className="text-[#a0a0a0] tracking-wider uppercase text-[10px] mb-0.5">
            Class
          </p>
          <p className="text-white font-mono">{student.grade || "—"}</p>
        </div>
        <div>
          <p className="text-[#a0a0a0] tracking-wider uppercase text-[10px] mb-0.5">
            Father
          </p>
          <p className="text-white truncate">{student.fatherName || "—"}</p>
        </div>
        <div>
          <p className="text-[#a0a0a0] tracking-wider uppercase text-[10px] mb-0.5">
            Mother
          </p>
          <p className="text-white truncate">{student.motherName || "—"}</p>
        </div>
      </div>
    </motion.div>
  );
}

function DetailForm({
  initial,
  onSave,
  onCancel,
  isEdit,
}: {
  initial: Omit<StudentDetail, "id">;
  onSave: (data: Omit<StudentDetail, "id">) => void;
  onCancel: () => void;
  isEdit: boolean;
}) {
  const [form, setForm] = useState<Omit<StudentDetail, "id">>(initial);
  const uid = useId();
  const photoInputId = `photo-form-${uid}`;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") set("photo", result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const fieldIds = {
    name: `${uid}-name`,
    age: `${uid}-age`,
    fatherName: `${uid}-fatherName`,
    motherName: `${uid}-motherName`,
    grade: `${uid}-grade`,
    bloodGroup: `${uid}-bloodGroup`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="glass-card rounded-sm p-5"
      style={{ borderColor: "rgba(0,245,255,0.2)" }}
    >
      <h3 className="text-sm font-semibold text-[#00f5ff] tracking-widest uppercase mb-4 flex items-center gap-2">
        <span
          className="w-1 h-4 bg-[#00f5ff] inline-block"
          style={{ boxShadow: "0 0 8px #00f5ff" }}
        />
        {isEdit ? "Edit Student" : "Add New Student"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {/* Photo upload */}
        <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
          <label
            htmlFor={photoInputId}
            className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white/5 cursor-pointer shrink-0"
            style={{ borderColor: "rgba(0,245,255,0.25)" }}
            title="Upload photo"
          >
            {form.photo ? (
              <img
                src={form.photo}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-10 h-10 text-[#a0a0a0]" />
            )}
          </label>
          <div>
            <label
              htmlFor={photoInputId}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <CameraIcon className="w-3.5 h-3.5" />
              {form.photo ? "Change Photo" : "Upload Photo"}
            </label>
            <p className="text-[10px] text-[#a0a0a0] mt-1">
              JPG, PNG up to 5MB
            </p>
          </div>
          <input
            id={photoInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {/* Text fields */}
        {(
          [
            ["name", "Full Name", "text"],
            ["age", "Age", "number"],
            ["fatherName", "Father's Name", "text"],
            ["motherName", "Mother's Name", "text"],
            ["grade", "Class / Grade", "text"],
          ] as [keyof typeof fieldIds & keyof typeof form, string, string][]
        ).map(([field, label, type]) => (
          <div key={field}>
            <label
              htmlFor={fieldIds[field]}
              className="block text-[10px] text-[#a0a0a0] tracking-widest uppercase mb-1"
            >
              {label}
            </label>
            <input
              id={fieldIds[field]}
              type={type}
              className="hud-input w-full px-2.5 py-1.5 rounded-sm"
              value={form[field] as string}
              placeholder={label}
              onChange={(e) => set(field, e.target.value as never)}
            />
          </div>
        ))}

        {/* Blood Group */}
        <div>
          <label
            htmlFor={fieldIds.bloodGroup}
            className="block text-[10px] text-[#a0a0a0] tracking-widest uppercase mb-1"
          >
            Blood Group
          </label>
          <select
            id={fieldIds.bloodGroup}
            className="hud-input w-full px-2.5 py-1.5 rounded-sm cursor-pointer"
            value={form.bloodGroup}
            onChange={(e) => set("bloodGroup", e.target.value as BloodGroup)}
          >
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g} className="bg-[#141414]">
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-white hover:bg-white/10 transition-all"
        >
          <XIcon className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-sm bg-[#00f5ff]/15 border border-[#00f5ff]/40 text-[#00f5ff] hover:bg-[#00f5ff]/25 transition-all"
          style={{ boxShadow: "0 0 10px rgba(0,245,255,0.1)" }}
        >
          <CheckIcon className="w-3.5 h-3.5" />
          {isEdit ? "Save Changes" : "Add Student"}
        </button>
      </div>
    </motion.div>
  );
}

export default function DetailsTab({ details, setDetails }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentDetail | null>(null);

  const filtered = details.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = useCallback(
    (data: Omit<StudentDetail, "id">) => {
      setDetails((prev) => [...prev, { ...data, id: Date.now().toString() }]);
      setShowForm(false);
    },
    [setDetails],
  );

  const handleEdit = useCallback(
    (data: Omit<StudentDetail, "id">) => {
      if (!editTarget) return;
      setDetails((prev) =>
        prev.map((s) => (s.id === editTarget.id ? { ...data, id: s.id } : s)),
      );
      setEditTarget(null);
    },
    [editTarget, setDetails],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setDetails((prev) => prev.filter((s) => s.id !== id));
    },
    [setDetails],
  );

  const handlePhotoUpload = useCallback(
    (id: string, dataUrl: string) => {
      setDetails((prev) =>
        prev.map((s) => (s.id === id ? { ...s, photo: dataUrl } : s)),
      );
    },
    [setDetails],
  );

  const openEdit = useCallback((s: StudentDetail) => {
    setEditTarget(s);
    setShowForm(false);
  }, []);

  // unused ref suppression — fileRef was removed in favour of label/input pattern
  const _unused = useRef(null);
  void _unused;

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a0a0a0]" />
          <input
            data-ocid="details.search_input"
            className="hud-input pl-8 pr-3 py-1.5 w-60 rounded-sm"
            placeholder="Search by name or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a0a0a0] font-mono">
            {details.length} student{details.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            data-ocid="details.add_button"
            onClick={() => {
              setShowForm((v) => !v);
              setEditTarget(null);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/20 transition-all"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <DetailForm
            initial={EMPTY_FORM}
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
            isEdit={false}
          />
        )}
        {editTarget && (
          <DetailForm
            key={editTarget.id}
            initial={editTarget}
            onSave={handleEdit}
            onCancel={() => setEditTarget(null)}
            isEdit
          />
        )}
      </AnimatePresence>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div
          data-ocid="details.empty_state"
          className="glass-card rounded-sm py-16 text-center text-[#a0a0a0] text-sm"
        >
          {search
            ? "No students match your search."
            : 'No student profiles yet. Click "Add Student" to create one.'}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filtered.map((student, idx) => (
              <StudentCard
                key={student.id}
                student={student}
                idx={idx}
                onEdit={openEdit}
                onDelete={handleDelete}
                onPhotoUpload={handlePhotoUpload}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
