"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";
import { themeColors } from "@/lib/themeColors";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { showToast } = useToast();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiClient.post("/api/auth/login", { email, password });
      showToast("Signed in successfully", "success");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };

      setError(
        apiError.response?.data?.error ??
          apiError.message ??
          "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --primary: ${themeColors.primary};
          --primary-hover: ${themeColors.primaryHover};
          --background: ${themeColors.background};
          --card-bg: ${themeColors.cardBackground};
          --text-primary: ${themeColors.textPrimary};
          --text-secondary: ${themeColors.textSecondary};
          --border: ${themeColors.border};
          --error: ${themeColors.error};
          --transition: 180ms ease;
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background);
          padding: 20px;
        }

        .login-form-container {
          width: 100%;
          max-width: 420px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px 28px;
        }

        /* Header */
        .form-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .form-icon-wrap {
          width: 48px;
          height: 48px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin: 0 auto 16px;
        }

        .form-title {
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
        }

        /* Error */
        .form-error {
          padding: 10px 14px;
          background-color: ${themeColors.error}10;
          border: 1px solid ${themeColors.error}30;
          border-radius: 8px;
          font-size: 13px;
          color: var(--error);
          text-align: center;
          margin-bottom: 20px;
          font-weight: 500;
        }

        /* Fields */
        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .field-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: var(--text-secondary);
        }

        .field-input {
          width: 100%;
          padding: 11px 14px 11px 42px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background-color: white;
        }

        .field-input:focus {
          border-color: var(--primary);
        }

        .field-toggle {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
        }

        /* Button */
        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
        }

        .submit-btn:hover {
          background-color: var(--primary-hover);
        }

        .submit-btn:disabled {
          opacity: 0.6;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-note {
          margin-top: 16px;
          font-size: 11px;
          text-align: center;
          color: var(--text-secondary);
        }
      `}</style>

      <div className="login-root">
        <div className="login-form-container">
          <div className="form-header">
            <div className="form-icon-wrap">
              <Shield size={22} />
            </div>
            <h1 className="form-title">Admin Login</h1>
            <p className="form-subtitle">
              Sign in to your Zomato Rider Management
            </p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-fields">
              <div className="field-group">
                <label className="field-label">Email</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className="field-input"
                    placeholder="you@daemoniq.com"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    className="field-input"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="field-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="form-note">Private access · Zomato Rider Management</p>
        </div>
      </div>
    </>
  );
}
