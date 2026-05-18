
import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  ArrowUp,
  Plus,
  User,
  Phone,
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
 
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
 
interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  phone_number: string;
  email: string;
  address: string;
}
 
interface Physiotherapist {
  therapist_id: number;
  first_name: string;
  last_name: string;
  active: boolean;
}
 
interface Appointment {
  appointment_id: number;
  patient_id: number;
  therapist_id: number;
  app_date: string;
  app_time: string;
  app_status: string;
  notes: string;
}
 
interface Billing {
  billing_id: number;
  amount: string;
  payment_status: string;
}
 
interface AppointmentReport {
  therapist_id: number;
  first_name: string;
  last_name: string;
  total_appointments: number;
}
 
export function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<Physiotherapist[]>([]);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [reportData, setReportData] = useState<AppointmentReport[]>([]);
 
  // Dialog open states
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
 
  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: "",
    therapist_id: "",
    app_date: "",
    app_time: "",
    app_status: "scheduled",
    notes: "",
  });
 
  // Patient form state
  const [patientForm, setPatientForm] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "",
    phone_number: "",
    email: "",
    address: "",
  });
 
  // Loading/error states for forms
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");
  const [patientError, setPatientError] = useState("");
 
  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    fetchTherapists();
    fetchBillings();
    fetchReports();
  }, []);
 
  const fetchPatients = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/patients");
      const data = await response.json();
      setPatients(data.patients);
    } catch (error) {
      console.error(error);
    }
  };
 
  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/appointments");
      const data = await response.json();
      setAppointments(data.appointments);
    } catch (error) {
      console.error(error);
    }
  };
 
  const fetchTherapists = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/physiotherapists");
      const data = await response.json();
      setTherapists(data.physiotherapists);
    } catch (error) {
      console.error(error);
    }
  };
 
  const fetchBillings = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/billings");
      const data = await response.json();
      setBillings(data.billings);
    } catch (error) {
      console.error(error);
    }
  };
 
  const fetchReports = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/reports/appointments_by_therapist"
      );
      const data = await response.json();
      setReportData(data.appointments_by_therapist);
    } catch (error) {
      console.error(error);
    }
  };
 
  // Handle Create Appointment
  const handleCreateAppointment = async () => {
    setAppointmentError("");
    if (
      !appointmentForm.patient_id ||
      !appointmentForm.therapist_id ||
      !appointmentForm.app_date ||
      !appointmentForm.app_time
    ) {
      setAppointmentError("Please fill in all required fields.");
      return;
    }
    setAppointmentLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: parseInt(appointmentForm.patient_id),
          therapist_id: parseInt(appointmentForm.therapist_id),
          plan_id: null,
          app_date: appointmentForm.app_date,
          app_time: appointmentForm.app_time + ":00",
          app_status: appointmentForm.app_status,
          notes: appointmentForm.notes || "",
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create appointment.");
      }
      await fetchAppointments();
      await fetchReports();
      setIsAppointmentDialogOpen(false);
      setAppointmentForm({
        patient_id: "",
        therapist_id: "",
        app_date: "",
        app_time: "",
        app_status: "scheduled",
        notes: "",
      });
    } catch (error: any) {
      setAppointmentError(error.message || "Error creating appointment. Please try again.");
      console.error(error);
    } finally {
      setAppointmentLoading(false);
    }
  };
 
  // Handle Create Patient
  const handleCreatePatient = async () => {
    setPatientError("");
    if (
      !patientForm.first_name ||
      !patientForm.last_name ||
      !patientForm.birth_date ||
      !patientForm.gender ||
      !patientForm.phone_number ||
      !patientForm.email ||
      !patientForm.address
    ) {
      setPatientError("Please fill in all required fields.");
      return;
    }
    if (patientForm.phone_number.length > 11) {
      setPatientError("Phone number must be 11 characters or fewer.");
      return;
    }
    setPatientLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientForm),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create patient.");
      }
      await fetchPatients();
      setIsPatientDialogOpen(false);
      setPatientForm({
        first_name: "",
        last_name: "",
        birth_date: "",
        gender: "",
        phone_number: "",
        email: "",
        address: "",
      });
    } catch (error: any) {
      setPatientError(error.message || "Error creating patient. Please try again.");
      console.error(error);
    } finally {
      setPatientLoading(false);
    }
  };
 
  const totalRevenue = billings.reduce(
    (sum, billing) => sum + parseFloat(billing.amount),
    0
  );
 
  const activeTherapists = therapists.filter((t) => t.active).length;
 
  const pendingPayments = billings.filter(
    (b) => b.payment_status !== "paid"
  ).length;
 
  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
      color: "#217e6b",
    },
    {
      title: "Appointments",
      value: appointments.length,
      icon: Calendar,
      color: "#3b82f6",
    },
    {
      title: "Active Therapists",
      value: activeTherapists,
      icon: User,
      color: "#22c55e",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "#f59e0b",
    },
  ];
 
  const appointmentChartData = reportData.map((item) => ({
    therapist: `${item.first_name}`,
    appointments: item.total_appointments,
  }));
 
  const revenueData = billings.map((billing, index) => ({
    name: `Payment ${index + 1}`,
    revenue: parseFloat(billing.amount),
  }));
 
  const getPatientName = (patientId: number) => {
    const patient = patients.find((p) => p.patient_id === patientId);
    return patient
      ? `${patient.first_name} ${patient.last_name}`
      : "Unknown Patient";
  };
 
  const getTherapistName = (therapistId: number) => {
    const therapist = therapists.find((t) => t.therapist_id === therapistId);
    return therapist
      ? `${therapist.first_name} ${therapist.last_name}`
      : "Unknown Therapist";
  };
 
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-[#22c55e]/10 text-[#22c55e]";
      case "confirmed":
        return "bg-[#3b82f6]/10 text-[#3b82f6]";
      case "scheduled":
        return "bg-[#f59e0b]/10 text-[#f59e0b]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
 
  // Shared input/select styles
  const inputClass =
    "w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#694588]";
  const labelClass = "block text-sm font-medium text-foreground mb-1";
 
  return (
    <div className="space-y-6">
      {/* ── New Appointment Dialog ── */}
      {isAppointmentDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsAppointmentDialogOpen(false)}
          />
          {/* Modal */}
          <div className="relative z-10 bg-background border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Appointment</h2>
              <button
                onClick={() => setIsAppointmentDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <div className="space-y-4">
              {/* Patient Select */}
              <div>
                <label className={labelClass}>Patient *</label>
                <select
                  className={inputClass}
                  value={appointmentForm.patient_id}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })
                  }
                >
                  <option value="">Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </div>
 
              {/* Therapist Select */}
              <div>
                <label className={labelClass}>Therapist *</label>
                <select
                  className={inputClass}
                  value={appointmentForm.therapist_id}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, therapist_id: e.target.value })
                  }
                >
                  <option value="">Select a therapist...</option>
                  {therapists.map((t) => (
                    <option key={t.therapist_id} value={t.therapist_id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>
 
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Date *</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={appointmentForm.app_date}
                    onChange={(e) =>
                      setAppointmentForm({ ...appointmentForm, app_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Time *</label>
                  <input
                    type="time"
                    className={inputClass}
                    value={appointmentForm.app_time}
                    onChange={(e) =>
                      setAppointmentForm({ ...appointmentForm, app_time: e.target.value })
                    }
                  />
                </div>
              </div>
 
              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={appointmentForm.app_status}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, app_status: e.target.value })
                  }
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
 
              {/* Notes */}
              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Optional notes..."
                  value={appointmentForm.notes}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, notes: e.target.value })
                  }
                />
              </div>
 
              {/* Error */}
              {appointmentError && (
                <p className="text-sm text-red-500">{appointmentError}</p>
              )}
            </div>
 
            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAppointmentDialogOpen(false)}
                disabled={appointmentLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#694588] hover:bg-[#9e74b9]"
                onClick={handleCreateAppointment}
                disabled={appointmentLoading}
              >
                {appointmentLoading ? "Saving..." : "Save Appointment"}
              </Button>
            </div>
          </div>
        </div>
      )}
 
      {/* ── New Patient Dialog ── */}
      {isPatientDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsPatientDialogOpen(false)}
          />
          {/* Modal */}
          <div className="relative z-10 bg-background border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Patient</h2>
              <button
                onClick={() => setIsPatientDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <div className="space-y-4">
              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="John"
                    value={patientForm.first_name}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Doe"
                    value={patientForm.last_name}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, last_name: e.target.value })
                    }
                  />
                </div>
              </div>
 
              {/* Birth Date */}
              <div>
                <label className={labelClass}>Birth Date *</label>
                <input
                  type="date"
                  className={inputClass}
                  value={patientForm.birth_date}
                  onChange={(e) =>
                    setPatientForm({ ...patientForm, birth_date: e.target.value })
                  }
                />
              </div>
 
              {/* Gender */}
              <div>
                <label className={labelClass}>Gender *</label>
                <select
                  className={inputClass}
                  value={patientForm.gender}
                  onChange={(e) =>
                    setPatientForm({ ...patientForm, gender: e.target.value })
                  }
                >
                  <option value="">Select gender...</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
 
              {/* Phone */}
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input
                    type="tel"
                    className={inputClass}
                    placeholder="55512345678"
                    maxLength={11}
                    value={patientForm.phone_number}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, phone_number: e.target.value })
                    }
                  />
              </div>
 
              {/* Email */}
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="john@example.com"
                  value={patientForm.email}
                  onChange={(e) =>
                    setPatientForm({ ...patientForm, email: e.target.value })
                  }
                />
              </div>
 
              {/* Address */}
              <div>
                <label className={labelClass}>Address *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="123 Main St, City"
                  value={patientForm.address}
                  onChange={(e) =>
                    setPatientForm({ ...patientForm, address: e.target.value })
                  }
                />
              </div>
 
              {/* Error */}
              {patientError && (
                <p className="text-sm text-red-500">{patientError}</p>
              )}
            </div>
 
            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsPatientDialogOpen(false)}
                disabled={patientLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#694588] hover:bg-[#9e74b9]"
                onClick={handleCreatePatient}
                disabled={patientLoading}
              >
                {patientLoading ? "Saving..." : "Save Patient"}
              </Button>
            </div>
          </div>
        </div>
      )}
 
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="mb-1">Dashboard</h1>
 
          <p className="text-muted-foreground">
            Welcome back to PhysioCare
          </p>
        </div>
 
        <div className="flex gap-2">
          <Button
            className="bg-[#694588] hover:bg-[#9e74b9]"
            onClick={() => {
              setAppointmentError("");
              setIsAppointmentDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
 
          <Button
            variant="outline"
            onClick={() => {
              setPatientError("");
              setIsPatientDialogOpen(true);
            }}
          >
            <User className="w-4 h-4 mr-2" />
            New Patient
          </Button>
        </div>
      </div>
 
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
 
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
 
                    <h3>{stat.value}</h3>
 
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUp className="w-3 h-3 text-[#4f0662]" />
 
                      <span className="text-xs text-[#6e4985]">
                        Live Data
                      </span>
                    </div>
                  </div>
 
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${stat.color}15`,
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: stat.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
 
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
 
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
 
                <XAxis dataKey="name" />
 
                <YAxis />
 
                <Tooltip />
 
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#217e6b"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
 
        {/* Appointments by therapist */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments by Therapist</CardTitle>
          </CardHeader>
 
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
 
                <XAxis dataKey="therapist" />
 
                <YAxis />
 
                <Tooltip />
 
                <Bar
                  dataKey="appointments"
                  fill="#217e6b"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
 
      {/* Recent Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Appointments</CardTitle>
 
          <Badge>{appointments.length} Total</Badge>
        </CardHeader>
 
        <CardContent>
          <div className="space-y-4">
            {appointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.appointment_id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">
                      {getPatientName(appointment.patient_id)}
                    </p>
 
                    <Badge
                      className={`${getStatusColor(
                        appointment.app_status
                      )} capitalize`}
                    >
                      {appointment.app_status}
                    </Badge>
                  </div>
 
                  <p className="text-sm text-muted-foreground">
                    Therapist: {getTherapistName(appointment.therapist_id)}
                  </p>
 
                  <p className="text-sm text-muted-foreground">
                    Date: {appointment.app_date}
                  </p>
 
                  <p className="text-sm text-muted-foreground">
                    Time: {appointment.app_time}
                  </p>
                </div>
 
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
 
                  <Button
                    size="sm"
                    className="bg-[#694588] hover:bg-[#9e74b9]"
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
