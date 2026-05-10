import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client";
import useAuthStore from "../store/useAuthStore";
import { loginSchema } from "../validators/schemas";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      login(res.data.user, res.data.token);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <span className="font-mono text-base-50 text-xl font-medium tracking-tight">
            Proto<span className="text-accent-blue">API</span>
          </span>
          <p className="text-base-400 text-xs mt-1">
            Instant mock backends for prototyping
          </p>
        </div>

        <div className="card p-6">
          <h1 className="text-base-50 text-base font-semibold mb-5">Sign in</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-base-300 text-xs mb-1.5">
                Email address
              </label>
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
              <label className="block text-base-300 text-xs mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-400 hover:text-base-100 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center mt-1"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-base-400 text-xs text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent-blue hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
