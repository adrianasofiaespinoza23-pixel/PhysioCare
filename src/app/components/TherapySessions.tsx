import React, { useEffect, useState } from "react";
import {
  Activity,
  Plus,
  Search,
  User,
  Calendar,
  FileText,
  HeartPulse,
  X,
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

import { Label } from "./ui/label";

import { Textarea } from "./ui/textarea";

interface TherapySession {
  session_id: number;
  appointment_id: number;
  session_date: string;
  techniques: string;
  pain_level: number;
  progress_notes: string;
}

interface Appointment {
  appointment_id: number;
  patient_id: number;
  therapist_id: number;
  app_date: string;
  app_status: string;
}

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
}

interface Therapist {
  therapist_id: number;
  first_name: string;
  last_name: string;
}

export function TherapySessions() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state — appointment_id drives patient + therapist automatically
  const [sessionForm, setSessionForm] = useState({
    appointment_id: "",
    session_date: "",
    pain_level: "",
    techniques: "",
    progress_notes: "",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchSessions();
    fetchAppointments();
    fetchPatients();
    fetchTherapists();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/therapy_sessions");
      const data = await response.json();
      setSessions(data.therapy_sessions || []);
    } catch (error) {
      console.error("Error fetching therapy sessions:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/appointments");
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/patients");
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchTherapists = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/physiotherapists");
      const data = await response.json();
      setTherapists(data.physiotherapists || []);
    } catch (error) {
      console.error("Error fetching therapists:", error);
    }
  };

  // ── Helpers ──────────────────────────────────────────────

  const getAppointment = (appointmentId: number) =>
    appointments.find((a) => a.appointment_id === appointmentId);

  const getPatientByAppointmentId = (appointmentId: number) => {
    const appt = getAppointment(appointmentId);
    if (!appt) return null;
    return patients.find((p) => p.patient_id === appt.patient_id) || null;
  };

  const getTherapistByAppointmentId = (appointmentId: number) => {
    const appt = getAppointment(appointmentId);
    if (!appt) return null;
    return therapists.find((t) => t.therapist_id === appt.therapist_id) || null;
  };

  const getPatientName = (appointmentId: number) => {
    const p = getPatientByAppointmentId(appointmentId);
    return p ? `${p.first_name} ${p.last_name}` : "Unknown Patient";
  };

  const getTherapistName = (appointmentId: number) => {
    const t = getTherapistByAppointmentId(appointmentId);
    return t ? `${t.first_name} ${t.last_name}` : "Unknown Therapist";
  };

  const getPainColor = (pain: number) => {
    if (pain <= 3) return "bg-[#22c55e]/10 text-[#22c55e]";
    if (pain <= 6) return "bg-[#f59e0b]/10 text-[#f59e0b]";
    return "bg-[#ef4444]/10 text-[#ef4444]";
  };

  // ── Selected appointment preview (shown in form) ─────────

  const selectedAppointment = sessionForm.appointment_id
    ? getAppointment(parseInt(sessionForm.appointment_id))
    : null;

  const selectedPatient = selectedAppointment
    ? getPatientByAppointmentId(selectedAppointment.appointment_id)
    : null;

  const selectedTherapist = selectedAppointment
    ? getTherapistByAppointmentId(selectedAppointment.appointment_id)
    : null;

  // ── Create session ────────────────────────────────────────

  const handleCreateSession = async () => {
    setFormError("");

    if (
      !sessionForm.appointment_id ||
      !sessionForm.session_date ||
      !sessionForm.pain_level ||
      !sessionForm.techniques ||
      !sessionForm.progress_notes
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const painLevel = parseInt(sessionForm.pain_level);
    if (isNaN(painLevel) || painLevel < 1 || painLevel > 10) {
      setFormError("Pain level must be a number between 1 and 10.");
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/therapy_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: parseInt(sessionForm.appointment_id),
          session_date: sessionForm.session_date,
          pain_level: painLevel,
          techniques: sessionForm.techniques,
          progress_notes: sessionForm.progress_notes,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create session.");
      }

      await fetchSessions();
      setIsDialogOpen(false);
      setSessionForm({
        appointment_id: "",
        session_date: "",
        pain_level: "",
        techniques: "",
        progress_notes: "",
      });
    } catch (error: any) {
      setFormError(error.message || "Error creating session. Please try again.");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Search filter ─────────────────────────────────────────

  const filteredSessions = sessions.filter((session) => {
    const patient = getPatientName(session.appointment_id).toLowerCase();
    const therapist = getTherapistName(session.appointment_id).toLowerCase();
    const q = searchQuery.toLowerCase();
    return (
      patient.includes(q) ||
      therapist.includes(q) ||
      session.techniques.toLowerCase().includes(q)
    );
  });

  const averagePain =
    sessions.length > 0
      ? (
          sessions.reduce((sum, s) => sum + s.pain_level, 0) / sessions.length
        ).toFixed(1)
      : "0";

  // Shared input styles (no shadcn dependency for form fields)
  const inputClass =
    "w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#694588]";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="space-y-6">

      {/* ── New Session Modal ── */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDialogOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Therapy Session</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">

              {/* Step 1 — Select appointment (drives patient + therapist) */}
              <div>
                <label className={labelClass}>Appointment *</label>
                <select
                  className={inputClass}
                  value={sessionForm.appointment_id}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, appointment_id: e.target.value })
                  }
                >
                  <option value="">Select an appointment...</option>
                  {appointments.map((appt) => (
                    <option key={appt.appointment_id} value={appt.appointment_id}>
                      #{appt.appointment_id} — {getPatientName(appt.appointment_id)} ({appt.app_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled info from selected appointment */}
              {selectedAppointment && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Patient: </span>
                    <span className="font-medium">
                      {selectedPatient
                        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                        : "Unknown"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Therapist: </span>
                    <span className="font-medium">
                      {selectedTherapist
                        ? `${selectedTherapist.first_name} ${selectedTherapist.last_name}`
                        : "Unknown"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Appointment date: </span>
                    <span className="font-medium">{selectedAppointment.app_date}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    <span className="font-medium capitalize">{selectedAppointment.app_status}</span>
                  </p>
                </div>
              )}

              {/* Session Date */}
              <div>
                <label className={labelClass}>Session Date *</label>
                <input
                  type="date"
                  className={inputClass}
                  value={sessionForm.session_date}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, session_date: e.target.value })
                  }
                />
              </div>

              {/* Pain Level */}
              <div>
                <label className={labelClass}>
                  Pain Level * &nbsp;
                  <span className="text-muted-foreground font-normal">(1 = none, 10 = severe)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className={inputClass}
                  placeholder="1 – 10"
                  value={sessionForm.pain_level}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, pain_level: e.target.value })
                  }
                />
              </div>

              {/* Techniques */}
              <div>
                <label className={labelClass}>Techniques *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Massage therapy, stretching, ultrasound..."
                  value={sessionForm.techniques}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, techniques: e.target.value })
                  }
                />
              </div>

              {/* Progress Notes */}
              <div>
                <label className={labelClass}>Progress Notes *</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  placeholder="Describe the patient's progress, observations, next steps..."
                  value={sessionForm.progress_notes}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, progress_notes: e.target.value })
                  }
                />
              </div>

              {/* Error */}
              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#694588] hover:bg-[#9e74b9]"
                onClick={handleCreateSession}
                disabled={formLoading}
              >
                {formLoading ? "Saving..." : "Save Session"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="mb-1">Therapy Sessions</h1>

          <p className="text-muted-foreground">
            Monitor patient recovery sessions
          </p>
        </div>

        <Button
          className="bg-[#694588] hover:bg-[#9e74b9]"
          onClick={() => {
            setFormError("");
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Total Sessions
              </p>

              <h2>{sessions.length}</h2>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Average Pain
              </p>

              <h2>{averagePain}</h2>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                High Pain Cases
              </p>

              <h2>
                {sessions.filter((s) => s.pain_level >= 7).length}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Active Patients
              </p>

              <h2>
                {
                  new Set(
                    sessions.map((s) => getPatientName(s.appointment_id))
                  ).size
                }
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Session Records</CardTitle>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search sessions..."
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
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Techniques</TableHead>
                  <TableHead>Pain Level</TableHead>
                  <TableHead>Progress Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell>{session.session_date}</TableCell>

                    <TableCell className="font-medium">
                      {getPatientName(session.appointment_id)}
                    </TableCell>

                    <TableCell>
                      {getTherapistName(session.appointment_id)}
                    </TableCell>

                    <TableCell>{session.techniques}</TableCell>

                    <TableCell>
                      <Badge className={getPainColor(session.pain_level)}>
                        <HeartPulse className="w-3 h-3 mr-1" />
                        {session.pain_level}/10
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-[250px] truncate">
                      {session.progress_notes}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No sessions found.
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