import { useState } from "react";
import { Plus, X } from "lucide-react";

const FIELD_TYPES = [
  "string",
  "name",
  "email",
  "number",
  "boolean",
  "date",
  "image_url",
  "uuid",
  "phone",
  "address",
  "company",
  "url",
  "username",
  "color",
];

// Colour hint per type shown via inline style (Tailwind can't do dynamic text colours at runtime)
const TYPE_COLOR = {
  string: "#9CA3AF",
  name: "#10B981",
  email: "#10B981",
  number: "#F59E0B",
  boolean: "#FF6B6B",
  date: "#F59E0B",
  image_url: "#10B981",
  uuid: "#9CA3AF",
  phone: "#10B981",
  address: "#10B981",
  company: "#10B981",
  url: "#10B981",
  username: "#10B981",
  color: "#F59E0B",
};

export default function SchemaBuilder({ onChange }) {
  const [fields, setFields] = useState([
    { name: "id", type: "uuid" },
    { name: "name", type: "name" },
  ]);

  const sync = (updated) => {
    setFields(updated);
    const def = {};
    updated.forEach((f) => {
      if (f.name.trim()) def[f.name.trim()] = f.type;
    });
    onChange(def);
  };

  const addField = () => sync([...fields, { name: "", type: "string" }]);
  const remove = (i) => {
    if (fields.length > 1) sync(fields.filter((_, idx) => idx !== i));
  };
  const change = (i, key, val) =>
    sync(fields.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));

  return (
    <div className="flex flex-col gap-2">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_160px_32px] gap-2 px-0.5 mb-1">
        <span className="text-[11px] font-medium text-tx-ghost uppercase tracking-widest">
          Field name
        </span>
        <span className="text-[11px] font-medium text-tx-ghost uppercase tracking-widest">
          Type
        </span>
        <span />
      </div>

      {fields.map((field, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_160px_32px] gap-2 items-center px-3 py-2 bg-surface-elevated/60 border border-line rounded-xl transition-colors duration-150 hover:border-line-hover focus-within:border-brand-ring/50 focus-within:bg-brand-muted"
        >
          {/* Field name — borderless inside the row */}
          <input
            placeholder="field_name"
            value={field.name}
            onChange={(e) => change(i, "name", e.target.value)}
            className="bg-transparent border-none outline-none ring-0 font-mono text-[12px] text-tx-primary placeholder-tx-ghost p-0 focus:ring-0 focus:border-none focus:bg-transparent focus:shadow-none w-full"
          />

          {/* Type select */}
          <select
            value={field.type}
            onChange={(e) => change(i, "type", e.target.value)}
            style={{ color: TYPE_COLOR[field.type] ?? "#9CA3AF" }}
            className="bg-surface-card border border-line rounded-lg px-2 py-1 font-mono text-[11px] outline-none cursor-pointer appearance-none transition-colors duration-150 hover:border-line-hover focus:border-brand-ring focus:ring-0"
          >
            {FIELD_TYPES.map((t) => (
              <option
                key={t}
                value={t}
                style={{
                  color: TYPE_COLOR[t] ?? "#9CA3AF",
                  background: "#1E222B",
                }}
              >
                {t}
              </option>
            ))}
          </select>

          {/* Remove */}
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent text-tx-ghost transition-all duration-150 hover:text-coral-accent hover:border-coral-border hover:bg-coral-muted"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* Add field */}
      <button
        type="button"
        onClick={addField}
        className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 text-[12px] font-medium text-brand border border-dashed border-brand-border rounded-xl transition-all duration-150 hover:bg-brand-muted hover:border-brand hover:text-brand"
      >
        <Plus size={13} />
        Add field
      </button>
    </div>
  );
}
