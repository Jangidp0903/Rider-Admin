"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { themeColors } from "@/lib/themeColors";
import {
  Loader2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
} from "lucide-react";
import { SubAdmin, SubAdminPagination } from "@/types/subAdmin";
import SubAdminModal from "@/components/SubAdminModal";
import DeleteModal from "@/components/DeleteModal";

export default function SubAdminPage() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdmin | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Modal States
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", loading: false });
  const [statusModal, setStatusModal] = useState({ isOpen: false, id: "", currentStatus: "", loading: false });

  const fetchSubAdmins = useCallback(async (page: number, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/sub-admin?page=${page}&search=${searchTerm}`);
      if (res.data.success) {
        setSubAdmins(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching sub admins:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSubAdmins(1, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchSubAdmins]);

  const handleToggleStatus = async () => {
    const { id, currentStatus } = statusModal;
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setStatusModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await axios.patch("/api/sub-admin", { id, status: newStatus });
      if (res.data.success) {
        setSubAdmins((prev) =>
          prev.map((sa) => (sa._id === id ? { ...sa, status: newStatus as any } : sa))
        );
        setStatusModal({ isOpen: false, id: "", currentStatus: "", loading: false });
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await axios.delete(`/api/sub-admin?id=${id}`);
      if (res.data.success) {
        setSubAdmins((prev) => prev.filter((sa) => sa._id !== id));
        setDeleteModal({ isOpen: false, id: "", loading: false });
      }
    } catch (err) {
      console.error("Error deleting sub admin:", err);
    } finally {
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-2 space-y-3 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeColors.primary + "15" }}>
            <ShieldCheck size={18} style={{ color: themeColors.primary }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: themeColors.textPrimary }}>
              Sub Admin Management
            </h1>
            <p className="text-xs font-normal" style={{ color: themeColors.textSecondary }}>
              Manage access and permissions for branch sub-admins.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedSubAdmin(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ backgroundColor: themeColors.primary }}
        >
          <Plus size={14} />
          Add Sub Admin
        </button>
      </div>

      {/* Stats/Summary Row (Optional, but looks premium) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }}>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Total Sub Admins</p>
            <p className="text-base font-bold" style={{ color: themeColors.textPrimary }}>{pagination.total}</p>
          </div>
        </div>
        <div className="p-2.5 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }}>
          <div className="p-2 rounded-xl bg-green-50 text-green-600">
            <ToggleRight size={16} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Active Now</p>
            <p className="text-base font-bold" style={{ color: themeColors.textPrimary }}>
              {subAdmins.filter(s => s.status === "active").length}
            </p>
          </div>
        </div>
        <div className="p-2.5 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }}>
          <div className="p-2 rounded-xl bg-zinc-50 text-zinc-600">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Hubs Managed</p>
            <p className="text-base font-bold" style={{ color: themeColors.textPrimary }}>
              {new Set(subAdmins.map(s => s.hubName)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: themeColors.textSecondary }} />
        <input
          type="text"
          placeholder="Search sub admins by name, email or hub..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border outline-none text-xs font-medium transition-all focus:ring-4"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.cardBackground,
            color: themeColors.textPrimary,
            "--tw-ring-color": themeColors.primary + "10",
          } as any}
        />
      </div>

      {/* Table Section */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: themeColors.background }}>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sub Admin Info</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Hub Assignment</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Created On</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="animate-spin" style={{ color: themeColors.primary }} />
                      <p className="text-sm font-bold text-zinc-500">Loading sub admins...</p>
                    </div>
                  </td>
                </tr>
              ) : subAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-sm font-bold text-zinc-500">No sub admins found.</p>
                  </td>
                </tr>
              ) : (
                subAdmins.map((sa) => (
                  <tr key={sa._id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: themeColors.primary + "10", color: themeColors.primary }}>
                          {sa.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: themeColors.textPrimary }}>{sa.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] font-normal text-zinc-500">
                              <Mail size={10} /> {sa.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-orange-50 text-orange-600">
                          <MapPin size={12} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: themeColors.textPrimary }}>{sa.hubName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setStatusModal({ isOpen: true, id: sa._id, currentStatus: sa.status, loading: false })}
                          className="relative inline-flex h-4 w-8 items-center rounded-full transition-all focus:outline-none cursor-pointer"
                          style={{
                            backgroundColor: sa.status === "active" ? themeColors.primary : "#e4e4e7",
                          }}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                              sa.status === "active" ? "translate-x-4.5" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span 
                          className="text-[9px] font-bold tracking-tighter"
                          style={{ color: sa.status === "active" ? themeColors.primary : "#71717a" }}
                        >
                          {sa.status === "active" ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Calendar size={12} />
                        <span className="text-[10px] font-normal">{formatDate(sa.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setSelectedSubAdmin(sa);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer" 
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: sa._id, loading: false })}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer" 
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
          <p className="text-[10px] font-semibold text-zinc-500">
            Showing <span style={{ color: themeColors.textPrimary }}>{subAdmins.length}</span> of <span style={{ color: themeColors.textPrimary }}>{pagination.total}</span> sub admins
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchSubAdmins(pagination.page - 1, search)}
              className="px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all disabled:opacity-30 hover:bg-white active:scale-95"
              style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }}
            >
              Previous
            </button>
            <div className="px-2 py-1 rounded-lg bg-white border text-[10px] font-bold" style={{ borderColor: themeColors.border, color: themeColors.primary }}>
              {pagination.page}
            </div>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchSubAdmins(pagination.page + 1, search)}
              className="px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all disabled:opacity-30 hover:bg-white active:scale-95"
              style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <SubAdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubAdmin(null);
        }}
        onSuccess={() => fetchSubAdmins(1, search)}
        subAdmin={selectedSubAdmin}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        isLoading={deleteModal.loading}
        title="Delete Sub Admin"
        message="Are you sure you want to remove this sub admin? This action cannot be undone."
      />

      {/* Status Change Confirmation Modal */}
      <DeleteModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        onConfirm={handleToggleStatus}
        isLoading={statusModal.loading}
        title={`${statusModal.currentStatus === "active" ? "Deactivate" : "Activate"} Sub Admin`}
        message={`Are you sure you want to ${statusModal.currentStatus === "active" ? "deactivate" : "activate"} this sub admin?`}
        confirmText={statusModal.currentStatus === "active" ? "Deactivate" : "Activate"}
        confirmIcon={statusModal.currentStatus === "active" ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
      />
    </div>
  );
}
