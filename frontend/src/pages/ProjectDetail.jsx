import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  Database,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client";
import AppLayout from "../components/AppLayout";
import SchemaBuilder from "../components/SchemaBuilder";
import { resourceSchema } from "../validators/schemas";

const METHOD_STYLES = {
  GET: "method-get",
  POST: "method-post",
  PUT: "method-put",
  DELETE: "method-delete",
};

const CRUD_ENDPOINTS = [
  { method: "GET", path: "/", note: "List all · ?page=1&limit=10" },
  { method: "GET", path: "/:id", note: "Get single record" },
  { method: "POST", path: "/", note: "Create · body or auto-gen" },
  { method: "PUT", path: "/:id", note: "Update record" },
  { method: "DELETE", path: "/:id", note: "Delete record" },
];

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [schema, setSchema] = useState({});
  const [schemaError, setSchemaError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [expandedSchema, setExpandedSchema] = useState({});

  const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/mock/${slug}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: { seedCount: 10 },
  });

  useEffect(() => {
    api
      .get(`/projects/${slug}`)
      .then((r) => {
        setProject(r.data.project);
        setResources(r.data.resources);
      })
      .catch(() => {
        toast.error("Project not found");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const onCreateResource = async (data) => {
    if (Object.keys(schema).length === 0) {
      setSchemaError("Add at least one field to the schema");
      return;
    }
    setSchemaError("");
    try {
      const res = await api.post("/resources", {
        projectId: project._id,
        name: data.name,
        schemaDefinition: schema,
        seedCount: data.seedCount,
      });
      setResources([...resources, res.data]);
      reset();
      setSchema({});
      setCreating(false);
      toast.success(`Resource "${res.data.name}" created`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create resource");
    }
  };

  const deleteResource = async (id, name) => {
    if (!confirm(`Delete resource "${name}" and all its records?`)) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter((r) => r._id !== id));
      toast.success("Resource deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const copyUrl = (resourceName) => {
    navigator.clipboard.writeText(`${BASE_URL}/${resourceName}`);
    setCopiedUrl(resourceName);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const toggleSchema = (id) =>
    setExpandedSchema((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading)
    return (
      <AppLayout>
        <div className="text-center py-20 text-[13px] text-tx-ghost">
          Loading project...
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-9 pb-20">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-[12px] text-tx-muted hover:text-tx-primary transition-colors mb-7 bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft size={13} />
          Projects
        </button>

        {/* Project header */}
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-tx-primary tracking-tight mb-2.5">
            {project?.name}
          </h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[12px] font-medium text-tx-muted">
              Base URL
            </span>
            <code className="font-mono text-[12px] text-brand bg-brand-muted border border-brand-border px-2.5 py-1 rounded-lg">
              {BASE_URL}/
            </code>
          </div>
          {project?.description && (
            <p className="text-[13px] text-tx-muted mt-2.5">
              {project.description}
            </p>
          )}
        </div>

        {/* Resources header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-tx-primary">
            Resources{" "}
            <span className="text-tx-muted font-normal">
              ({resources.length})
            </span>
          </span>
          {!creating && (
            <button
              className="btn-primary"
              onClick={() => {
                setCreating(true);
                reset();
                setSchema({});
                setSchemaError("");
              }}
            >
              <Plus size={14} />
              Add resource
            </button>
          )}
        </div>

        {/* Empty state */}
        {resources.length === 0 && !creating && (
          <div className="card p-12 text-center mb-3">
            <div className="w-11 h-11 bg-surface-elevated border border-line rounded-xl flex items-center justify-center text-tx-ghost mx-auto mb-3.5">
              <Database size={18} />
            </div>
            <p className="text-[14px] font-semibold text-tx-primary mb-1.5">
              No resources yet
            </p>
            <p className="text-[13px] text-tx-muted">
              Add a resource to generate live CRUD endpoints.
            </p>
          </div>
        )}

        {/* Resource cards */}
        <div className="flex flex-col gap-3 mb-3">
          {resources.map((r) => (
            <div
              key={r._id}
              className="bg-surface-card border border-line rounded-2xl overflow-hidden transition-colors duration-150 hover:border-line-hover"
            >
              {/* Resource header row */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-line gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-brand-muted border border-brand-border rounded-lg flex items-center justify-center text-brand shrink-0">
                    <Database size={13} />
                  </div>
                  <span className="font-mono text-[13.5px] font-medium text-tx-primary">
                    {r.name}
                  </span>
                  <span className="text-[11px] text-tx-secondary bg-surface-elevated border border-line px-2 py-0.5 rounded-md">
                    {r.totalRecords} records
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyUrl(r.name)}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                      copiedUrl === r.name
                        ? "text-brand border-brand-border bg-brand-muted"
                        : "text-tx-secondary border-line bg-surface-elevated hover:text-brand hover:border-brand-border hover:bg-brand-muted"
                    }`}
                  >
                    {copiedUrl === r.name ? (
                      <>
                        <CheckCircle size={11} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteResource(r._id, r.name)}
                    className="btn-danger"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Endpoint rows */}
              <div>
                {CRUD_ENDPOINTS.map(({ method, path, note }) => {
                  const fullPath = `${BASE_URL}/${r.name}${path === "/" ? "" : path}`;
                  // Split path on :param segments for amber colouring
                  const parts = fullPath.split(/(:\w+)/g);
                  return (
                    <div
                      key={method + path}
                      className="grid grid-cols-[72px_1fr_auto] items-center gap-4 px-5 py-2.5 border-b border-surface-elevated last:border-b-0 transition-colors duration-100 hover:bg-white/[0.015]"
                    >
                      <span
                        className={`font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border text-center ${METHOD_STYLES[method]}`}
                      >
                        {method}
                      </span>
                      <code className="font-mono text-[12px] text-tx-primary/80 overflow-hidden text-ellipsis whitespace-nowrap">
                        {parts.map((part, i) =>
                          part.startsWith(":") ? (
                            <span key={i} className="text-amber-accent">
                              {part}
                            </span>
                          ) : (
                            part
                          ),
                        )}
                      </code>
                      <span className="text-[11px] text-tx-ghost hidden sm:block whitespace-nowrap">
                        {note}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Schema footer — collapsible */}
              <button
                type="button"
                onClick={() => toggleSchema(r._id)}
                className="w-full flex items-center gap-2 flex-wrap px-5 py-2.5 bg-surface-base border-t border-line text-left cursor-pointer transition-colors duration-100 hover:bg-surface-elevated/30"
              >
                <span className="text-[10px] font-medium text-tx-ghost uppercase tracking-wider">
                  Schema
                </span>
                {Object.entries(r.schemaDefinition).map(([field, type]) => (
                  <span
                    key={field}
                    className="font-mono text-[10.5px] text-tx-secondary bg-surface-elevated border border-line px-2 py-0.5 rounded-md"
                  >
                    {field}:<span className="text-amber-accent">{type}</span>
                  </span>
                ))}
                <span className="ml-auto text-tx-ghost">
                  {expandedSchema[r._id] ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                </span>
              </button>

              {/* Expanded JSON */}
              {expandedSchema[r._id] && (
                <div className="px-5 pb-4">
                  <pre className="mt-2 bg-surface-base border border-line rounded-xl p-4 font-mono text-[12px] text-tx-secondary overflow-auto max-h-44 leading-relaxed">
                    {JSON.stringify(r.schemaDefinition, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create resource form */}
        {creating && (
          <div className="card-glow p-6">
            <p className="text-[14px] font-semibold text-tx-primary tracking-tight mb-5">
              New resource
            </p>
            <form
              onSubmit={handleSubmit(onCreateResource)}
              className="flex flex-col gap-5"
            >
              {/* Name + seed count */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
                <div>
                  <label className="field-label">
                    Resource name{" "}
                    <span className="text-tx-ghost font-normal">
                      (lowercase, underscores)
                    </span>
                  </label>
                  <input
                    placeholder="e.g. users"
                    autoFocus
                    className="font-mono"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="field-error">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="field-label">
                    Seed records{" "}
                    <span className="text-tx-ghost font-normal">(0–50)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    {...register("seedCount")}
                  />
                  {errors.seedCount && (
                    <p className="field-error">{errors.seedCount.message}</p>
                  )}
                </div>
              </div>

              {/* Schema builder */}
              <div>
                <label className="field-label mb-2">Schema fields</label>
                <div className="bg-surface-elevated border border-line rounded-xl p-4">
                  <SchemaBuilder onChange={setSchema} />
                </div>
                {schemaError && (
                  <p className="field-error mt-1.5">{schemaError}</p>
                )}
              </div>

              {/* JSON preview */}
              {Object.keys(schema).length > 0 && (
                <div>
                  <label className="field-label mb-1.5">Preview</label>
                  <pre className="bg-surface-base border border-line rounded-xl p-4 font-mono text-[12px] text-tx-secondary overflow-auto max-h-44 leading-relaxed">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Creating..." : "Create & seed"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setCreating(false);
                    setSchemaError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
