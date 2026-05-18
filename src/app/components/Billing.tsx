import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Download,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  X,
} from 'lucide-react';
 
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
 
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
 
// ── Interfaces ────────────────────────────────────────────────────────────────
 
interface BillingRecord {
  billing_id: number;
  appointment_id: number;
  amount: string;
  payment_date: string;
  method: string;
  payment_status: string;
  notes: string;
}
 
interface Appointment {
  appointment_id: number;
  patient_id: number;
  therapist_id: number;
  plan_id: number | null;
  app_date: string;
  app_time: string;
  app_status: string;
  notes: string;
}
 
interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
}
 
// ── Component ─────────────────────────────────────────────────────────────────
 
export function BillingPage() {
  const [billings, setBillings] = useState<BillingRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
 
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
 
  // Form state
  const [billingForm, setBillingForm] = useState({
    appointment_id: '',
    amount: '',
    method: '',
    payment_date: '',
    payment_status: '',
    notes: '',
  });
 
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
 
  useEffect(() => {
    fetchData();
  }, []);
 
  const fetchData = async () => {
    try {
      const [billingsRes, appointmentsRes, patientsRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/billings'),
        fetch('http://127.0.0.1:5000/appointments'),
        fetch('http://127.0.0.1:5000/patients'),
      ]);
 
      const billingsData = await billingsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const patientsData = await patientsRes.json();
 
      setBillings(billingsData.billings || []);
      setAppointments(appointmentsData.appointments || []);
      setPatients(patientsData.patients || []);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    }
  };
 
  // ── Helpers ───────────────────────────────────────────────────────────────
 
  const getAppointment = (appointmentId: number) =>
    appointments.find((a) => a.appointment_id === appointmentId);
 
  const getPatientName = (appointmentId: number) => {
    const appointment = getAppointment(appointmentId);
    if (!appointment) return 'Unknown Patient';
    const patient = patients.find((p) => p.patient_id === appointment.patient_id);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };
 
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':    return 'bg-[#22c55e]/10 text-[#22c55e]';
      case 'partial': return 'bg-[#3b82f6]/10 text-[#3b82f6]';
      case 'pending': return 'bg-[#f59e0b]/10 text-[#f59e0b]';
      case 'overdue': return 'bg-[#ef4444]/10 text-[#ef4444]';
      default:        return 'bg-muted text-muted-foreground';
    }
  };
 
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':    return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      default:        return null;
    }
  };
 
  // ── Selected appointment preview ──────────────────────────────────────────
 
  const selectedAppointment = billingForm.appointment_id
    ? getAppointment(parseInt(billingForm.appointment_id))
    : null;
 
  const selectedPatient = selectedAppointment
    ? patients.find((p) => p.patient_id === selectedAppointment.patient_id)
    : null;
 
  // ── Create billing ────────────────────────────────────────────────────────
 
  const handleCreateBilling = async () => {
    setFormError('');
 
    if (
      !billingForm.appointment_id ||
      !billingForm.amount ||
      !billingForm.method ||
      !billingForm.payment_date ||
      !billingForm.payment_status
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }
 
    const amount = parseFloat(billingForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Amount must be a valid positive number.');
      return;
    }
 
    setFormLoading(true);
 
    try {
      const response = await fetch('http://127.0.0.1:5000/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: parseInt(billingForm.appointment_id),
          amount: billingForm.amount,
          payment_date: billingForm.payment_date,
          method: billingForm.method,
          payment_status: billingForm.payment_status,
          notes: billingForm.notes || '',
        }),
      });
 
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create billing.');
      }
 
      await fetchData();
      setIsDialogOpen(false);
      setBillingForm({
        appointment_id: '',
        amount: '',
        method: '',
        payment_date: '',
        payment_status: '',
        notes: '',
      });
    } catch (error: any) {
      setFormError(error.message || 'Error creating billing. Please try again.');
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };
 
  // ── Derived stats ─────────────────────────────────────────────────────────
 
  const filteredBillings = billings.filter((billing) => {
    const patientName = getPatientName(billing.appointment_id).toLowerCase();
    const q = searchQuery.toLowerCase();
    return (
      patientName.includes(q) ||
      billing.method.toLowerCase().includes(q) ||
      billing.payment_status.toLowerCase().includes(q)
    );
  });
 
  const totalRevenue = billings.reduce(
    (sum, b) => sum + parseFloat(b.amount), 0
  );
 
  const paidInvoices   = billings.filter((b) => b.payment_status.toLowerCase() === 'paid').length;
  const pendingInvoices = billings.filter(
    (b) => b.payment_status.toLowerCase() === 'pending' ||
           b.payment_status.toLowerCase() === 'partial'
  );
  const overdueInvoices = billings.filter((b) => b.payment_status.toLowerCase() === 'overdue').length;
 
  const paymentData = [
    { name: 'Paid',    value: billings.filter((b) => b.payment_status.toLowerCase() === 'paid').length,    color: '#22c55e' },
    { name: 'Partial', value: billings.filter((b) => b.payment_status.toLowerCase() === 'partial').length, color: '#3b82f6' },
    { name: 'Pending', value: billings.filter((b) => b.payment_status.toLowerCase() === 'pending').length, color: '#f59e0b' },
    { name: 'Overdue', value: billings.filter((b) => b.payment_status.toLowerCase() === 'overdue').length, color: '#ef4444' },
  ];
 
  // Shared styles
  const inputClass =
    'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#694588]';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';
 
  // ── Render ────────────────────────────────────────────────────────────────
 
  return (
    <div className="space-y-6">
 
      {/* ── Add Billing Modal ── */}
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
              <h2 className="text-lg font-semibold">Add Billing</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <div className="space-y-4">
 
              {/* Appointment select — drives patient info */}
              <div>
                <label className={labelClass}>Appointment *</label>
                <select
                  className={inputClass}
                  value={billingForm.appointment_id}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, appointment_id: e.target.value })
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
 
              {/* Auto-filled patient info */}
              {selectedAppointment && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Patient: </span>
                    <span className="font-medium">
                      {selectedPatient
                        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                        : 'Unknown'}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Appointment date: </span>
                    <span className="font-medium">{selectedAppointment.app_date}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Appointment status: </span>
                    <span className="font-medium capitalize">{selectedAppointment.app_status}</span>
                  </p>
                </div>
              )}
 
              {/* Amount */}
              <div>
                <label className={labelClass}>Amount * (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                  value={billingForm.amount}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, amount: e.target.value })
                  }
                />
              </div>
 
              {/* Payment Method + Date in a row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Payment Method *</label>
                  <select
                    className={inputClass}
                    value={billingForm.method}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, method: e.target.value })
                    }
                  >
                    <option value="">Select method...</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
 
                <div>
                  <label className={labelClass}>Payment Date *</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={billingForm.payment_date}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, payment_date: e.target.value })
                    }
                  />
                </div>
              </div>
 
              {/* Status */}
              <div>
                <label className={labelClass}>Status *</label>
                <select
                  className={inputClass}
                  value={billingForm.payment_status}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, payment_status: e.target.value })
                  }
                >
                  <option value="">Select status...</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
 
              {/* Notes */}
              <div>
                <label className={labelClass}>Notes</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Additional notes..."
                  value={billingForm.notes}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, notes: e.target.value })
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
                onClick={handleCreateBilling}
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Save Billing'}
              </Button>
            </div>
          </div>
        </div>
      )}
 
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="mb-1">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Manage clinic payments and invoices
          </p>
        </div>
 
        <Button
          className="bg-[#694588] hover:bg-[#9e74b9]"
          onClick={() => {
            setFormError('');
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Billing
        </Button>
      </div>
 
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h2 className="text-[#217e6b]">${totalRevenue.toLocaleString()}</h2>
              </div>
              <DollarSign className="w-8 h-8 text-[#217e6b]" />
            </div>
          </CardContent>
        </Card>
 
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
                <h2 className="text-[#22c55e]">{paidInvoices}</h2>
              </div>
              <CheckCircle className="w-8 h-8 text-[#22c55e]" />
            </div>
          </CardContent>
        </Card>
 
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <h2 className="text-[#f59e0b]">{pendingInvoices.length}</h2>
              </div>
              <Clock className="w-8 h-8 text-[#f59e0b]" />
            </div>
          </CardContent>
        </Card>
 
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <h2 className="text-[#ef4444]">{overdueInvoices}</h2>
              </div>
              <XCircle className="w-8 h-8 text-[#ef4444]" />
            </div>
          </CardContent>
        </Card>
      </div>
 
      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Status Overview</CardTitle>
          </CardHeader>
 
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
 
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
 
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
 
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Statement
            </Button>
 
            <Button variant="outline" className="w-full justify-start">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Status
            </Button>
          </CardContent>
        </Card>
      </div>
 
      {/* Billing Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Billings</CardTitle>
 
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search billings..."
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
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
 
              <TableBody>
                {filteredBillings.map((billing) => (
                  <TableRow key={billing.billing_id}>
                    <TableCell className="font-medium">
                      #{billing.billing_id}
                    </TableCell>
 
                    <TableCell>
                      {getPatientName(billing.appointment_id)}
                    </TableCell>
 
                    <TableCell>
                      ${parseFloat(billing.amount).toLocaleString()}
                    </TableCell>
 
                    <TableCell className="capitalize">
                      {billing.method}
                    </TableCell>
 
                    <TableCell>{billing.payment_date}</TableCell>
 
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          billing.payment_status
                        )} capitalize flex items-center gap-1 w-fit`}
                      >
                        {getStatusIcon(billing.payment_status)}
                        {billing.payment_status}
                      </Badge>
                    </TableCell>
 
                    <TableCell className="max-w-[250px] truncate">
                      {billing.notes}
                    </TableCell>
                  </TableRow>
                ))}
 
                {filteredBillings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No billing records found.
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
