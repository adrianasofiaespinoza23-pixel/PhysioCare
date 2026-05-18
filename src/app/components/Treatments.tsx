import React, { useEffect, useState, memo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface TreatmentPlan {
  plan_id: number;
  patient_id: number;
  therapist_id: number;
  diagnosis: string;
  start_date: string;
  end_date: string;
  frequency: string;
  plan_status: string;
}

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
}

interface Physiotherapist {
  therapist_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
}

// ── Empty form helper ─────────────────────────────────────────────────────────

const emptyForm = {
  patient_id: "",
  therapist_id: "",
  diagnosis: "",
  start_date: "",
  end_date: "",
  frequency: "",
  plan_status: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Treatments() {
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Physiotherapist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Which treatment is being edited / deleted
  const [editingTreatment, setEditingTreatment] = useState<TreatmentPlan | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Shared form data (used for both create and edit)
  const [formData, setFormData] = useState({ ...emptyForm });

  // Loading / error per modal
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError]   = useState("");
  const [editLoading, setEditLoading]   = useState(false);
  const [editError, setEditError]       = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      const [treatmentsRes, patientsRes, therapistsRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/treatment_plans"),
        fetch("http://127.0.0.1:5000/patients"),
        fetch("http://127.0.0.1:5000/physiotherapists"),
      ]);

      const treatmentsData  = await treatmentsRes.json();
      const patientsData    = await patientsRes.json();
      const therapistsData  = await therapistsRes.json();

      setTreatments(treatmentsData.treatment_plans || []);
      setPatients(patientsData.patients || []);
      setTherapists(therapistsData.physiotherapists || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getPatientName = (patientId: number) => {
    const p = patients.find((p) => p.patient_id === patientId);
    return p ? `${p.first_name} ${p.last_name}` : "Unknown Patient";
  };

  const getTherapistName = (therapistId: number) => {
    const t = therapists.find((t) => t.therapist_id === therapistId);
    return t ? `${t.first_name} ${t.last_name}` : "Unknown Therapist";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-[#22c55e]/10 text-[#22c55e]";
      case "active":    return "bg-[#3b82f6]/10 text-[#3b82f6]";
      case "pending":   return "bg-[#f59e0b]/10 text-[#f59e0b]";
      default:          return "bg-muted text-muted-foreground";
    }
  };

  const validateForm = () => {
    if (
      !formData.patient_id ||
      !formData.therapist_id ||
      !formData.diagnosis ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.frequency ||
      !formData.plan_status
    ) return "Please fill in all required fields.";
    if (formData.end_date < formData.start_date)
      return "End date cannot be before start date.";
    return "";
  };

  // ── Create ───────────────────────────────────────────────────────────────────

  const handleCreateTreatment = async () => {
    const err = validateForm();
    if (err) { setCreateError(err); return; }

    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/treatment_plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          patient_id:   parseInt(formData.patient_id),
          therapist_id: parseInt(formData.therapist_id),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error creating treatment plan.");
      }

      await fetchData();
      setIsCreateOpen(false);
      setFormData({ ...emptyForm });
    } catch (error: any) {
      setCreateError(error.message || "Error creating treatment plan.");
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────

  const openEditDialog = (treatment: TreatmentPlan) => {
    setEditingTreatment(treatment);
    setFormData({
      patient_id:   treatment.patient_id.toString(),
      therapist_id: treatment.therapist_id.toString(),
      diagnosis:    treatment.diagnosis,
      start_date:   treatment.start_date,
      end_date:     treatment.end_date,
      frequency:    treatment.frequency,
      plan_status:  treatment.plan_status,
    });
    setEditError("");
    setIsEditOpen(true);
  };

  const handleUpdateTreatment = async () => {
    if (!editingTreatment) return;

    const err = validateForm();
    if (err) { setEditError(err); return; }

    setEditLoading(true);
    setEditError("");

    try {
      // ✅ correct endpoint: /treatment_plans/<id> (plural)
      const res = await fetch(
        `http://127.0.0.1:5000/treatment_plans/${editingTreatment.plan_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            patient_id:   parseInt(formData.patient_id),
            therapist_id: parseInt(formData.therapist_id),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error updating treatment plan.");
      }

      await fetchData();
      setIsEditOpen(false);
      setEditingTreatment(null);
      setFormData({ ...emptyForm });
    } catch (error: any) {
      setEditError(error.message || "Error updating treatment plan.");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteTreatment = async () => {
    if (deletingId === null) return;

    setDeleteLoading(true);

    try {
      // ✅ correct endpoint: /treatment_plans/<id> (plural)
      const res = await fetch(
        `http://127.0.0.1:5000/treatment_plans/${deletingId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error deleting treatment plan.");
      }

      await fetchData();
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Search filter ────────────────────────────────────────────────────────────

  const filteredTreatments = treatments.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      getPatientName(t.patient_id).toLowerCase().includes(q) ||
      getTherapistName(t.therapist_id).toLowerCase().includes(q) ||
      t.diagnosis.toLowerCase().includes(q) ||
      t.plan_status.toLowerCase().includes(q)
    );
  });

  // ── Stats ────────────────────────────────────────────────────────────────────

  const activeTreatments    = treatments.filter((t) => t.plan_status.toLowerCase() === "active").length;
  const completedTreatments = treatments.filter((t) => t.plan_status.toLowerCase() === "completed").length;
  const pendingTreatments   = treatments.filter((t) => t.plan_status.toLowerCase() === "pending").length;

  // ── Shared styles ────────────────────────────────────────────────────────────

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#694588]";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  // ── Reusable form fields (memorized to prevent losing focus) ─────────────────

  const TreatmentFormFields = memo(() => (
    <div className="space-y-4">
      {/* Patient */}
      <div>
        <label className={labelClass}>Patient *</label>
        <select
          className={inputClass}
          value={formData.patient_id}
          onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
        >
          <option value="">Select a patient...</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>
      </div>

      {/* Therapist */}
      <div>
        <label className={labelClass}>Physiotherapist *</label>
        <select
          className={inputClass}
          value={formData.therapist_id}
          onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
        >
          <option value="">Select a physiotherapist...</option>
          {therapists.map((t) => (
            <option key={t.therapist_id} value={t.therapist_id}>
              {t.first_name} {t.last_name} — {t.specialization}
            </option>
          ))}
        </select>
      </div>

      {/* Diagnosis */}
      <div>
        <label className={labelClass}>Diagnosis *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Describe the diagnosis..."
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
        />
      </div>

      {/* Start / End date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start Date *</label>
          <input
            type="date"
            className={inputClass}
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>End Date *</label>
          <input
            type="date"
            className={inputClass}
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className={labelClass}>Frequency *</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. 2 times/week"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
        />
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Status *</label>
        <select
          className={inputClass}
          value={formData.plan_status}
          onChange={(e) => setFormData({ ...formData, plan_status: e.target.value })}
        >
          <option value="">Select status...</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  ));

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Create Modal ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCreateOpen(false)} />
          <div className="relative z-10 bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Treatment Plan</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <TreatmentFormFields />

            {createError && <p className="text-sm text-red-500 mt-3">{createError}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createLoading}>
                Cancel
              </Button>
              <Button className="bg-[#694588] hover:bg-[#9e74b9]" onClick={handleCreateTreatment} disabled={createLoading}>
                {createLoading ? "Saving..." : "Save Treatment Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)} />
          <div className="relative z-10 bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Edit Treatment Plan</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <TreatmentFormFields />

            {editError && <p className="text-sm text-red-500 mt-3">{editError}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={editLoading}>
                Cancel
              </Button>
              <Button className="bg-[#694588] hover:bg-[#9e74b9]" onClick={handleUpdateTreatment} disabled={editLoading}>
                {editLoading ? "Updating..." : "Update Treatment Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative z-10 bg-background border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Delete Treatment Plan</h2>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              Are you sure you want to delete this treatment plan? Any linked appointments will have their plan reference removed.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTreatment} disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="mb-1">Treatment Plans</h1>
          <p className="text-muted-foreground">Manage physiotherapy treatment plans</p>
        </div>

        <Button
          className="bg-[#694588] hover:bg-[#9e74b9]"
          onClick={() => {
            setFormData({ ...emptyForm });
            setCreateError("");
            setIsCreateOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Treatment Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Active Plans</p>
            <h2>{activeTreatments}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <h2>{completedTreatments}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <h2>{pendingTreatments}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Treatment Plans History</CardTitle>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Physiotherapist</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTreatments.map((treatment) => (
                  <TableRow key={treatment.plan_id}>
                    <TableCell className="font-medium">
                      {getPatientName(treatment.patient_id)}
                    </TableCell>

                    <TableCell>
                      {getTherapistName(treatment.therapist_id)}
                    </TableCell>

                    <TableCell className="max-w-[200px] truncate">
                      {treatment.diagnosis}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {treatment.start_date} → {treatment.end_date}
                    </TableCell>

                    <TableCell>{treatment.frequency}</TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(treatment.plan_status)}>
                        {treatment.plan_status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(treatment)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(treatment.plan_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredTreatments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No treatment plans found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}