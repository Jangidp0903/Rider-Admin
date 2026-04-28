"use client";

import {
  User,
  Lock,
  Mail,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { themeColors } from "@/lib/themeColors";
import { useState, FocusEvent, MouseEvent, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/context/ToastContext";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/api/auth/me");
        setFormData({
          username: res.data.username || "",
          email: res.data.email || "",
        });
      } catch (err: unknown) {
        showToast(
          (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to fetch profile",
          "error",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  const handleProfileSave = async () => {
    if (!formData.username || !formData.email) {
      showToast("Username and email are required", "error");
      return;
    }

    setProfileSaving(true);
    try {
      await apiClient.patch("/api/auth/profile", {
        username: formData.username,
        email: formData.email,
      });
      setProfileSaved(true);
      showToast("Profile updated successfully", "success");
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: unknown) {
        showToast(
          (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update profile",
          "error",
        );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All password fields are required", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    setPasswordUpdating(true);
    try {
      await apiClient.patch("/api/auth/password", {
        currentPassword,
        newPassword,
      });
      setPasswordUpdated(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("Password updated successfully", "success");
      setTimeout(() => setPasswordUpdated(false), 2500);
    } catch (err: unknown) {
      showToast(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update password",
        "error",
      );
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: themeColors.primary }}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: themeColors.background }}
    >
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div
          className="pb-2 border-b"
          style={{ borderColor: themeColors.border }}
        >
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              color: themeColors.textPrimary,
            }}
          >
            Settings
          </h1>
          <p
            className="mt-1.5 text-sm"
            style={{ color: themeColors.textSecondary }}
          >
            Manage your admin profile and dashboard preferences.
          </p>
        </div>

        {/* Profile Information Card */}
        <div
          className="w-full rounded-2xl border overflow-hidden transition-all duration-200 hover:border-opacity-80"
          style={{
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.border,
          }}
        >
          {/* Card Header */}
          <div
            className="px-6 py-5 border-b"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.cardBackground,
                }}
              >
                <User
                  className="w-4 h-4"
                  style={{ color: themeColors.textSecondary }}
                />
              </div>
              <div>
                <h2
                  className="text-base font-semibold"
                  style={{ color: themeColors.textPrimary }}
                >
                  Profile Information
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: themeColors.textSecondary }}
                >
                  Update your account profile details.
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-7 md:px-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Username */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl text-sm font-medium outline-none transition-all duration-200"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.textPrimary,
                    }}
                    onFocus={(e: FocusEvent<HTMLInputElement>) => {
                      e.target.style.borderColor = themeColors.primary;
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e: FocusEvent<HTMLInputElement>) => {
                      e.target.style.borderColor = themeColors.border;
                      e.target.style.backgroundColor = themeColors.background;
                    }}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Email Address
                  </label>
                  <div
                    className="flex rounded-xl border overflow-hidden transition-all duration-200"
                    style={{ borderColor: themeColors.border }}
                    onFocusCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.primary;
                    }}
                    onBlurCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.border;
                    }}
                  >
                    <span
                      className="inline-flex items-center px-3 border-r"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.border,
                      }}
                    >
                      <Mail
                        className="w-4 h-4"
                        style={{ color: themeColors.textSecondary }}
                      />
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="flex-1 px-4 py-3 text-sm font-medium outline-none transition-all duration-200"
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.textPrimary,
                      }}
                      onFocus={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.style.backgroundColor = "#ffffff";
                      }}
                      onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.style.backgroundColor = themeColors.background;
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button Row */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: themeColors.primary,
                    borderColor: themeColors.primary,
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (!profileSaving) {
                      e.currentTarget.style.backgroundColor =
                        themeColors.primaryHover;
                      e.currentTarget.style.borderColor =
                        themeColors.primaryHover;
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (!profileSaving) {
                      e.currentTarget.style.backgroundColor =
                        themeColors.primary;
                      e.currentTarget.style.borderColor = themeColors.primary;
                    }
                  }}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
                {profileSaved && (
                  <span
                    className="flex items-center gap-1.5 text-sm font-medium transition-opacity duration-300"
                    style={{ color: themeColors.primary }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Saved successfully
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div
          className="w-full rounded-2xl border overflow-hidden transition-all duration-200 hover:border-opacity-80"
          style={{
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.border,
          }}
        >
          {/* Card Header */}
          <div
            className="px-6 py-5 border-b"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.cardBackground,
                }}
              >
                <Lock
                  className="w-4 h-4"
                  style={{ color: themeColors.textSecondary }}
                />
              </div>
              <div>
                <h2
                  className="text-base font-semibold"
                  style={{ color: themeColors.textPrimary }}
                >
                  Change Password
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: themeColors.textSecondary }}
                >
                  Ensure your account uses a long, random password to stay
                  secure.
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-7 md:px-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Current Password
                  </label>
                  <div
                    className="flex items-center border rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.background,
                    }}
                    onFocusCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.primary;
                    }}
                    onBlurCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.border;
                    }}
                  >
                    <input
                      type={showCurrent ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-3 text-sm outline-none transition-all duration-200 bg-transparent"
                      style={{ color: themeColors.textPrimary }}
                      onFocus={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.closest("div")!.style.backgroundColor =
                          "#ffffff";
                      }}
                      onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.closest("div")!.style.backgroundColor =
                          themeColors.background;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="px-3 flex items-center transition-colors duration-200 cursor-pointer"
                      style={{ color: themeColors.textSecondary }}
                      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = themeColors.primary;
                      }}
                      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = themeColors.textSecondary;
                      }}
                      tabIndex={-1}
                      aria-label={
                        showCurrent ? "Hide password" : "Show password"
                      }
                    >
                      {showCurrent ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.textSecondary }}
                  >
                    New Password
                  </label>
                  <div
                    className="flex items-center border rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.background,
                    }}
                    onFocusCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.primary;
                    }}
                    onBlurCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.border;
                    }}
                  >
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-3 text-sm outline-none transition-all duration-200 bg-transparent"
                      style={{ color: themeColors.textPrimary }}
                      onFocus={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.closest("div")!.style.backgroundColor =
                          "#ffffff";
                      }}
                      onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.closest("div")!.style.backgroundColor =
                          themeColors.background;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="px-3 flex items-center transition-colors duration-200 cursor-pointer"
                      style={{ color: themeColors.textSecondary }}
                      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = themeColors.primary;
                      }}
                      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = themeColors.textSecondary;
                      }}
                      tabIndex={-1}
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Confirm New Password
                  </label>
                  <div
                    className="flex items-center border rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.background,
                    }}
                    onFocusCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.primary;
                    }}
                    onBlurCapture={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        themeColors.border;
                    }}
                  >
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-3 text-sm outline-none transition-all duration-200 bg-transparent"
                      style={{ color: themeColors.textPrimary }}
                      onFocus={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.closest("div")!.style.backgroundColor =
                          "#ffffff";
                      }}
                      onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        e.target.closest("div")!.style.backgroundColor =
                          themeColors.background;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="px-3 flex items-center transition-colors duration-200 cursor-pointer"
                      style={{ color: themeColors.textSecondary }}
                      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = themeColors.primary;
                      }}
                      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = themeColors.textSecondary;
                      }}
                      tabIndex={-1}
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                className="border-t pt-2"
                style={{ borderColor: themeColors.border }}
              />

              {/* Password hint */}
              <p
                className="text-xs"
                style={{ color: themeColors.textSecondary }}
              >
                Use at least 8 characters including uppercase, lowercase,
                numbers, and symbols.
              </p>

              {/* Update Button Row */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  disabled={passwordUpdating}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: themeColors.primary,
                    borderColor: themeColors.primary,
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (!passwordUpdating) {
                      e.currentTarget.style.backgroundColor =
                        themeColors.primaryHover;
                      e.currentTarget.style.borderColor =
                        themeColors.primaryHover;
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (!passwordUpdating) {
                      e.currentTarget.style.backgroundColor =
                        themeColors.primary;
                      e.currentTarget.style.borderColor = themeColors.primary;
                    }
                  }}
                >
                  {passwordUpdating ? "Updating..." : "Update Password"}
                </button>
                {passwordUpdated && (
                  <span
                    className="flex items-center gap-1.5 text-sm font-medium transition-opacity duration-300"
                    style={{ color: themeColors.primary }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Password updated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
