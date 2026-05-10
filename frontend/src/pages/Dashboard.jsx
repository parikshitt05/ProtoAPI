import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, FolderOpen, Trash2, ChevronRight, Layers } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client";
import AppLayout from "../components/AppLayout";
import { projectSchema } from "../validators/schemas";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(projectSchema) });

  useEffect(() => {
    api
      .get("/projects")
      .then((r) => setProjects(r.data))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const onCreateProject = async (data) => {
    try {
      const res = await api.post("/projects", data);
      setProjects([res.data, ...projects]);
      reset();
      setCreating(false);
      toast.success("Project created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this project and all its resources?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-tx-primary tracking-tight">
              Projects
            </h1>
            <p className="text-[13px] text-tx-muted mt-1">
              <span className="text-tx-secondary">{projects.length} of 3</span>{" "}
              projects used · Free plan
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {projects.length >= 3 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-accent bg-amber-muted border border-amber-border rounded-lg px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-accent" />
                Limit reached
              </span>
            )}
            <button
              className="btn-primary"
              onClick={() => {
                setCreating(true);
                reset();
              }}
            >
              <Plus size={14} />
              New project
            </button>
          </div>
        </div>

        {/* Create project form */}
        {creating && (
          <div className="card-glow p-6 mb-5">
            <p className="text-[14px] font-semibold text-tx-primary tracking-tight mb-5">
              New project
            </p>
            <form
              onSubmit={handleSubmit(onCreateProject)}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="field-label">Project name</label>
                <input
                  placeholder="e.g. E-commerce prototype"
                  autoFocus
                  {...register("name")}
                  className="input-data"
                />
                {errors.name && (
                  <p className="field-error">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="field-label">
                  Description{" "}
                  <span className="text-tx-ghost font-normal">(optional)</span>
                </label>
                <input
                  placeholder="What are you prototyping?"
                  {...register("description")}
                  className="input-data"
                />
                {errors.description && (
                  <p className="field-error">{errors.description.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Creating..." : "Create project"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects list */}
        {loading ? (
          <div className="text-center py-16 text-[13px] text-tx-ghost">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-14 text-center">
            <div className="w-12 h-12 bg-brand-muted border border-brand-border rounded-2xl flex items-center justify-center text-brand mx-auto mb-4">
              <Layers size={20} />
            </div>
            <p className="text-[15px] font-semibold text-tx-primary mb-1.5">
              No projects yet
            </p>
            <p className="text-[13px] text-tx-muted">
              Create a project to get your first mock endpoint.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/project/${p.slug}`)}
                className="group flex items-center justify-between px-4 py-3.5 bg-surface-card border border-line rounded-2xl cursor-pointer transition-all duration-200 hover:border-brand-border hover:bg-[#1a1e28] hover:-translate-y-px hover:shadow-deep gap-4"
              >
                {/* Left */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 bg-brand-muted border border-brand-border rounded-xl flex items-center justify-center text-brand shrink-0">
                    <FolderOpen size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-tx-primary tracking-tight truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2.5 mt-0.5">
                      <span className="font-mono text-[11px] text-tx-ghost">
                        /mock/{p.slug}/
                      </span>
                      <span className="text-[11px] text-tx-muted bg-surface-elevated border border-line px-1.5 py-0.5 rounded-md">
                        {p.resourceCount} resource
                        {p.resourceCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => deleteProject(e, p._id)}
                    className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete project"
                  >
                    <Trash2 size={12} />
                  </button>
                  <ChevronRight
                    size={15}
                    className="text-tx-ghost group-hover:text-brand transition-all duration-200 group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
