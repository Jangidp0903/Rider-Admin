"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";

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
          --blue-500: #3b82f6;
          --blue-600: #2563eb;
          --blue-700: #1d4ed8;
          --slate-50: #f8fafc;
          --slate-200: #e2e8f0;
          --slate-300: #cbd5e1;
          --slate-400: #94a3b8;
          --slate-500: #64748b;
          --slate-700: #334155;
          --slate-900: #0f172a;
          --red-50: #fef2f2;
          --red-200: #fecaca;
          --red-700: #b91c1c;
          --white: #ffffff;
          --transition: 180ms ease;
        }

        .login-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background-color: var(--slate-50);
        }

        /* ── Left panel ── */
        .login-panel {
          display: none;
          flex: 1;
          background-color: var(--white);
          border-right: 1px solid var(--slate-200);
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        @media (min-width: 1024px) {
          .login-panel { display: flex; }
        }

        .panel-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panel-brand-icon {
          width: 36px;
          height: 36px;
          border: 1.5px solid var(--slate-200);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--blue-600);
        }

        .panel-brand-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--slate-900);
          letter-spacing: -0.01em;
        }

        .panel-body {
          max-width: 360px;
        }

        .panel-divider {
          width: 32px;
          height: 2px;
          background-color: var(--blue-600);
          margin-bottom: 20px;
        }

        .panel-heading {
          font-size: 26px;
          font-weight: 300;
          line-height: 1.4;
          color: var(--slate-900);
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }

        .panel-heading strong {
          font-weight: 600;
        }

        .panel-desc {
          font-size: 13px;
          color: var(--slate-500);
          line-height: 1.7;
        }

        .panel-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 32px;
        }

        .panel-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--slate-500);
        }

        .panel-stat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--blue-600);
          flex-shrink: 0;
        }

        .panel-footer {
          font-size: 12px;
          color: var(--slate-400);
          font-family: inherit;
        }

        /* ── Right / form side ── */
        .login-form-side {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background-color: var(--slate-50);
        }

        @media (min-width: 1024px) {
          .login-form-side {
            width: 480px;
            flex-shrink: 0;
            background-color: var(--white);
            border-left: 1px solid var(--slate-200);
          }
        }

        .login-form-container {
          width: 100%;
          max-width: 400px;
        }

        /* ── Header ── */
        .form-header {
          margin-bottom: 40px;
        }

        .form-icon-wrap {
          width: 44px;
          height: 44px;
          border: 1.5px solid var(--slate-200);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--blue-600);
          margin-bottom: 24px;
        }

        .form-title {
          font-size: 22px;
          font-weight: 600;
          color: var(--slate-900);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-size: 13px;
          color: var(--slate-500);
          line-height: 1.5;
        }

        /* ── Error ── */
        .form-error {
          padding: 10px 14px;
          background-color: var(--red-50);
          border: 1px solid var(--red-200);
          border-radius: 8px;
          font-size: 13px;
          color: var(--red-700);
          text-align: center;
          margin-bottom: 24px;
          font-weight: 500;
        }

        /* ── Fields ── */
        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 28px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--slate-700);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .field-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: var(--slate-400);
          pointer-events: none;
          transition: color var(--transition);
        }

        .field-input-wrap:focus-within .field-icon {
          color: var(--blue-500);
        }

        .field-input {
          width: 100%;
          padding: 11px 14px 11px 42px;
          border: 1.5px solid var(--slate-200);
          border-radius: 8px;
          font-size: 14px;
          color: var(--slate-900);
          background-color: var(--white);
          outline: none;
          transition: border-color var(--transition), background-color var(--transition);
          -webkit-appearance: none;
        }

        .field-input::placeholder {
          color: var(--slate-400);
        }

        .field-input:hover {
          border-color: var(--slate-300);
          background-color: var(--slate-50);
        }

        .field-input:focus {
          border-color: var(--blue-500);
          background-color: var(--white);
        }

        .field-input-mono {
            font-family: var(--font-mono);
          letter-spacing: 0.04em;
          padding-right: 44px;
        }

        .field-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--slate-400);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color var(--transition);
          border-radius: 4px;
        }

        .field-toggle:hover {
          color: var(--slate-700);
        }

        /* ── Divider ── */
        .form-divider {
          height: 1px;
          background-color: var(--slate-200);
          margin-bottom: 28px;
        }

        /* ── Submit ── */
        .submit-btn {
          width: 100%;
          padding: 12px 20px;
          background-color: var(--blue-600);
          color: var(--white);
          border: 1.5px solid var(--blue-600);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color var(--transition), border-color var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: -0.01em;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: var(--blue-700);
          border-color: var(--blue-700);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          margin-top: 20px;
          font-size: 11px;
          color: var(--slate-400);
          text-align: center;
        }
      `}</style>

      <div className="login-root">
        {/* Left panel */}
        <div className="login-panel">
          <div className="panel-brand">
            <div className="panel-brand-icon border-none">
              <Image
                src="/logo.png"
                alt="DaemonIQ"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <span className="panel-brand-name">DaemonIQ</span>
          </div>

          <div className="panel-body">
            <div className="panel-divider" />
            <p className="panel-heading">
              Welcome back,
              <br />
              <strong>your platform awaits.</strong>
            </p>
            <p className="panel-desc">
              This is your personal command center for DaemonIQ — built by you,
              run by you. Everything is exactly where you left it.
            </p>
            <div className="panel-stats">
              <div className="panel-stat">
                <span className="panel-stat-dot" />
                Full control over users, content &amp; settings
              </div>
              <div className="panel-stat">
                <span className="panel-stat-dot" />
                Real-time system monitoring &amp; analytics
              </div>
              <div className="panel-stat">
                <span className="panel-stat-dot" />
                Private access — only you can sign in
              </div>
            </div>
          </div>

          <p className="panel-footer">© {new Date().getFullYear()} DaemonIQ.</p>
        </div>

        {/* Right form side */}
        <div className="login-form-side">
          <div className="login-form-container">
            <div className="form-header">
              <div className="form-icon-wrap border-none">
                <Image
                  src="/logo.png"
                  alt="DaemonIQ"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="form-title">Welcome back</h1>
              <p className="form-subtitle">
                Sign in to your DaemonIQ admin panel.
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
                      type="text"
                      required
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                      className="field-input"
                      placeholder="you@daemoniq.com"
                      autoComplete="email"
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
                      className="field-input font-mono"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="field-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-divider" />

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="form-note">Private access · DaemonIQ Admin</p>
          </div>
        </div>
      </div>
    </>
  );
}
