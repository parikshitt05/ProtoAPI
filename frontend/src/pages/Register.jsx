import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import useAuthStore from "../store/useAuthStore";
import { registerSchema } from "../validators/schemas";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/register", {
        email: data.email,
        password: data.password,
      });
      login(res.data.user, res.data.token);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="font-mono text-[22px] font-semibold text-tx-primary tracking-tight">
            Proto<span className="text-brand">API</span>
          </span>
          <p className="text-[13px] text-tx-muted mt-1.5">
            Instant mock backends for prototyping
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-line rounded-3xl p-8 shadow-card">
          <h1 className="text-[18px] font-semibold text-tx-primary tracking-tight mb-6">
            Create account
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="field-label">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="field-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="field-error">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="field-label">Confirm password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="field-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center mt-1 py-3 text-[14px]"
            >
              {isSubmitting ? "Creating account..." : "Create account →"}
            </button>
          </form>
        </div>

        <p className="text-[12px] text-tx-muted text-center mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand font-medium hover:text-brand/80 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
