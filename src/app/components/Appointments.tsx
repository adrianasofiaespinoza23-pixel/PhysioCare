import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

import { Label } from './ui/label';
import { Input } from './ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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

interface Physiotherapist {
  therapist_id: number;
  first_name: string;
  last_name: string;
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Physiotherapist[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    therapist_id: '',
    app_date: '',
    app_time: '',
    app_status: 'scheduled',
    notes: '',
  });

  // View Calendar dialog state
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Manage Time Slots dialog state
  const allTimeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00',
  ];
  const [timeSlotsOpen, setTimeSlotsOpen] = useState(false);
  const [activeSlots, setActiveSlots] = useState<string[]>([
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  ]);

  const toggleSlot = (slot: string) => {
    setActiveSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort()
    );
  };

  // Block Time dialog state
  interface BlockedSlot {
    id: number;
    therapist_id: string;
    date: string;
    from: string;
    to: string;
    reason: string;
  }
  const [blockTimeOpen, setBlockTimeOpen] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [blockForm, setBlockForm] = useState({
    therapist_id: '',
    date: '',
    from: '',
    to: '',
    reason: '',
  });

  const handleAddBlock = () => {
    if (!blockForm.date || !blockForm.from || !blockForm.to) return;
    const newBlock: BlockedSlot = {
      id: Date.now(),
      therapist_id: blockForm.therapist_id,
      date: blockForm.date,
      from: blockForm.from,
      to: blockForm.to,
      reason: blockForm.reason,
    };
    setBlockedSlots((prev) => [...prev, newBlock]);
    setBlockForm({ therapist_id: '', date: '', from: '', to: '', reason: '' });
  };

  const handleRemoveBlock = (id: number) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
  };

  // Check if a time slot is blocked for the current date
  const isSlotBlocked = (slot: string): boolean => {
    const dateStr = (() => {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();
    return blockedSlots.some((b) => {
      if (b.date !== dateStr) return false;
      return slot >= b.from && slot < b.to;
    });
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchTherapists();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/appointments');
      const data = await response.json();
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/patients');
      const data = await response.json();
      setPatients(data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchTherapists = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/physiotherapists');
      const data = await response.json();
      setTherapists(data.physiotherapists);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    }
  };

  // CREATE APPOINTMENT
  const handleCreateAppointment = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:5000/appointment',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            patient_id: Number(newAppointment.patient_id),

            therapist_id: Number(
              newAppointment.therapist_id
            ),

            plan_id: null,

            app_date: newAppointment.app_date,

            app_time: newAppointment.app_time,

            app_status: newAppointment.app_status,

            notes: newAppointment.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to create appointment'
        );
      }

      await fetchAppointments();

      setNewAppointment({
        patient_id: '',
        therapist_id: '',
        app_date: '',
        app_time: '',
        app_status: 'scheduled',
        notes: '',
      });

      alert(
        'Appointment created successfully!'
      );

    } catch (error) {

      console.error(error);

      alert('Error creating appointment');
    }
  };

  // DELETE APPOINTMENT
  const handleDeleteAppointment = async (
    appointmentId: number
  ) => {

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this appointment?'
    );

    if (!confirmDelete) return;

    try {

      const response = await fetch(
        `http://127.0.0.1:5000/appointment/${appointmentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete appointment'
        );
      }

      await fetchAppointments();

      alert(
        'Appointment deleted successfully!'
      );

    } catch (error) {

      console.error(error);

      alert('Error deleting appointment');
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find(
      (p) => p.patient_id === patientId
    );

    return patient
      ? `${patient.first_name} ${patient.last_name}`
      : `Patient #${patientId}`;
  };

  const getTherapistName = (therapistId: number) => {
    const therapist = therapists.find(
      (t) => t.therapist_id === therapistId
    );

    return therapist
      ? `${therapist.first_name} ${therapist.last_name}`
      : `Therapist #${therapistId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]';

      case 'in-progress':
        return 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]';

      case 'scheduled':
        return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]';

      case 'completed':
        return 'bg-[#6c757d]/10 text-[#6c757d] border-[#6c757d]';

      case 'cancelled':
        return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]';

      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Parse date string directly to avoid timezone shifting.
  // new Date("2026-05-13") is parsed as UTC midnight, which in UTC-5 (Ecuador)
  // becomes May 12 at 19:00 local — shifting the date back by one day.
  // Slicing the YYYY-MM-DD parts and comparing as numbers avoids this entirely.
  const isSameDay = (appDate: string, reference: Date): boolean => {
    const datePart = appDate?.slice(0, 10);
    if (!datePart) return false;
    const [year, month, day] = datePart.split('-').map(Number);
    return (
      year === reference.getFullYear() &&
      month === reference.getMonth() + 1 &&
      day === reference.getDate()
    );
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);

    newDate.setDate(currentDate.getDate() + days);

    setCurrentDate(newDate);
  };

  // Filter appointments to only show those matching the currently selected date
  const filteredAppointments: Appointment[] = appointments
    .filter((apt) => isSameDay(apt.app_date, currentDate))
    .sort((a, b) => {
      // Sort by time ascending (HH:MM format compares correctly as strings)
      const timeA = a.app_time?.slice(0, 5) ?? '';
      const timeB = b.app_time?.slice(0, 5) ?? '';
      return timeA.localeCompare(timeB);
    });

  // timeSlots is derived from activeSlots so Manage Time Slots changes take effect live
  const timeSlots = [...activeSlots].sort();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="mb-1">Appointments</h1>

          <p className="text-muted-foreground">
            Manage your clinic appointments
          </p>
        </div>

        {/* New Appointment */}
        <Dialog>

          <DialogTrigger asChild>
            <Button className="bg-[#694588] hover:bg-[#9e74b9]">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">

            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">

              {/* Patient */}
              <div className="space-y-2 col-span-2">

                <Label>Patient</Label>

                <Select
                  onValueChange={(value) =>
                    setNewAppointment({
                      ...newAppointment,
                      patient_id: value,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>

                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem
                        key={patient.patient_id}
                        value={String(patient.patient_id)}
                      >
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">

                <Label>Date</Label>

                <Input
                  type="date"
                  value={newAppointment.app_date}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      app_date: e.target.value,
                    })
                  }
                />
              </div>

              {/* Time */}
              <div className="space-y-2">

                <Label>Time</Label>

                <Input
                  type="time"
                  value={newAppointment.app_time}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      app_time: e.target.value,
                    })
                  }
                />
              </div>

              {/* Therapist */}
              <div className="space-y-2">

                <Label>Doctor</Label>

                <Select
                  onValueChange={(value) =>
                    setNewAppointment({
                      ...newAppointment,
                      therapist_id: value,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>

                  <SelectContent>
                    {therapists.map((therapist) => (
                      <SelectItem
                        key={therapist.therapist_id}
                        value={String(therapist.therapist_id)}
                      >
                        {therapist.first_name} {therapist.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">

                <Label>Duration (minutes)</Label>

                <Input
                  type="number"
                  placeholder="30"
                />
              </div>

              {/* Status */}
              <div className="space-y-2 col-span-2">

                <Label>Status</Label>

                <Select
                  defaultValue="scheduled"
                  onValueChange={(value) =>
                    setNewAppointment({
                      ...newAppointment,
                      app_status: value,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="scheduled">
                      Scheduled
                    </SelectItem>

                    <SelectItem value="confirmed">
                      Confirmed
                    </SelectItem>

                    <SelectItem value="in-progress">
                      In Progress
                    </SelectItem>

                    <SelectItem value="completed">
                      Completed
                    </SelectItem>

                    <SelectItem value="cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>

                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2 col-span-2">

                <Label>Notes</Label>

                <Input
                  placeholder="Additional notes..."
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">

              <Button variant="outline">
                Cancel
              </Button>

              <Button
                onClick={handleCreateAppointment}
                className="bg-[#694588] hover:bg-[#9e74b9]"
              >
                Book Appointment
              </Button>

            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="pt-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-2">

              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(-1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="min-w-[280px] text-center">
                <h3>{formatDate(currentDate)}</h3>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Schedule */}
        <Card className="lg:col-span-2">

          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Schedule</span>
              {filteredAppointments.length > 0 && (
                <Badge className="bg-[#694588]/10 text-[#694588] border-[#694588]">
                  {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>

            {/* Empty state: no appointments for this day */}
            {filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <CalendarIcon className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">No appointments</p>
                <p className="text-sm text-muted-foreground">
                  There are no appointments scheduled for this day.
                </p>
              </div>
            ) : (
              <div className="space-y-1">

                {timeSlots.map((slot) => {

                  // Match appointments whose hour falls within this slot.
                  // e.g. slot "10:00" catches 10:00, 10:15, 10:30, 10:45
                  const slotHour = parseInt(slot.split(':')[0], 10);
                  const appointmentsAtSlot = filteredAppointments.filter((apt) => {
                    const aptHour = parseInt(apt.app_time?.slice(0, 2) ?? '-1', 10);
                    return aptHour === slotHour;
                  });

                  const hasAppointments = appointmentsAtSlot.length > 0;
                  const slotBlocked = isSlotBlocked(slot);

                  return (
                    <div
                      key={slot}
                      className={`flex gap-4 ${hasAppointments || slotBlocked ? 'min-h-[72px]' : 'min-h-[52px]'}`}
                    >
                      {/* Time label */}
                      <div className={`w-16 shrink-0 text-sm font-medium pt-2 text-right pr-2 ${hasAppointments ? 'text-foreground' : slotBlocked ? 'text-[#ef4444]' : 'text-muted-foreground'}`}>
                        {slot}
                      </div>

                      {/* Vertical line + content */}
                      <div className="flex gap-3 flex-1 border-t border-border pt-2">

                        {/* Dot indicator on the timeline */}
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${hasAppointments ? 'bg-[#694588]' : slotBlocked ? 'bg-[#ef4444]' : 'bg-border'}`} />
                          <div className="w-px flex-1 bg-border mt-1" />
                        </div>

                        {/* Appointment cards, blocked slot, or available */}
                        <div className="flex-1 pb-2 space-y-2">

                          {slotBlocked && !hasAppointments ? (
                            <div className="flex items-center gap-2 h-[36px] px-3 rounded-lg bg-[#ef4444]/5 border border-dashed border-[#ef4444]/40">
                              <span className="w-2 h-2 rounded-full bg-[#ef4444]/60 shrink-0" />
                              <span className="text-xs text-[#ef4444]/80 font-medium">Blocked</span>
                              {(() => {
                                const dateStr = (() => {
                                  const y = currentDate.getFullYear();
                                  const m = String(currentDate.getMonth() + 1).padStart(2, '0');
                                  const d = String(currentDate.getDate()).padStart(2, '0');
                                  return `${y}-${m}-${d}`;
                                })();
                                const block = blockedSlots.find((b) => b.date === dateStr && slot >= b.from && slot < b.to);
                                return block?.reason ? (
                                  <span className="text-xs text-muted-foreground">· {block.reason}</span>
                                ) : null;
                              })()}
                            </div>
                          ) : hasAppointments ? (
                            appointmentsAtSlot.map((apt) => (

                              <Dialog key={apt.appointment_id}>

                                <DialogTrigger asChild>

                                  <div
                                    className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all hover:translate-x-0.5 ${getStatusColor(apt.app_status)}`}
                                  >

                                    <div className="flex items-start justify-between mb-1.5">

                                      <p className="font-semibold text-sm leading-tight">
                                        {getPatientName(apt.patient_id)}
                                      </p>

                                      <Badge
                                        className={`${getStatusColor(apt.app_status)} capitalize text-xs ml-2 shrink-0`}
                                      >
                                        {apt.app_status}
                                      </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">

                                      <span className="flex items-center gap-1">
                                        <User className="w-3 h-3 shrink-0" />
                                        <span className="truncate max-w-[120px]">
                                          {getTherapistName(apt.therapist_id)}
                                        </span>
                                      </span>

                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        {apt.app_time?.slice(0, 5)}
                                      </span>
                                    </div>

                                    {apt.notes && (
                                      <p className="mt-1.5 text-xs text-muted-foreground italic truncate">
                                        {apt.notes}
                                      </p>
                                    )}
                                  </div>
                                </DialogTrigger>

                                {/* Details Dialog */}
                                <DialogContent>

                                  <DialogHeader>
                                    <DialogTitle>
                                      Appointment Details
                                    </DialogTitle>
                                  </DialogHeader>

                                  <div className="space-y-4">

                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        Appointment ID
                                      </p>

                                      <p>{apt.appointment_id}</p>
                                    </div>

                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        Patient
                                      </p>

                                      <p className="font-medium">
                                        {getPatientName(apt.patient_id)}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        Therapist
                                      </p>

                                      <p>
                                        {getTherapistName(apt.therapist_id)}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">

                                      <div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Date
                                        </p>

                                        <p>{apt.app_date}</p>
                                      </div>

                                      <div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Time
                                        </p>

                                        <p>
                                          {apt.app_time?.slice(0, 5)}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        Status
                                      </p>

                                      <Badge
                                        className={`${getStatusColor(apt.app_status)} capitalize`}
                                      >
                                        {apt.app_status}
                                      </Badge>
                                    </div>

                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        Notes
                                      </p>

                                      <p>{apt.notes}</p>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">

                                      <Button
                                        variant="destructive"
                                        onClick={() =>
                                          handleDeleteAppointment(apt.appointment_id)
                                        }
                                      >
                                        Delete Appointment
                                      </Button>

                                    </div>

                                  </div>
                                </DialogContent>
                              </Dialog>
                            ))
                          ) : (
                            <div className="h-[36px] flex items-center">
                              <span className="text-xs text-muted-foreground/60">
                                Available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side */}
        <div className="space-y-6">

          {/* Summary */}
          <Card>

            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#217e6b]/5">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Total
                  </p>

                  <p className="text-2xl font-semibold text-[#217e6b]">
                    {filteredAppointments.length}
                  </p>
                </div>

                <CalendarIcon className="w-8 h-8 text-[#217e6b]" />
              </div>

              <div className="space-y-2">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Scheduled
                  </span>

                  <Badge className="bg-[#f59e0b]/10 text-[#f59e0b]">
                    {
                      filteredAppointments.filter(
                        (a) => a.app_status === 'scheduled'
                      ).length
                    }
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Confirmed
                  </span>

                  <Badge className="bg-[#22c55e]/10 text-[#22c55e]">
                    {
                      filteredAppointments.filter(
                        (a) => a.app_status === 'confirmed'
                      ).length
                    }
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    In Progress
                  </span>

                  <Badge className="bg-[#3b82f6]/10 text-[#3b82f6]">
                    {
                      filteredAppointments.filter(
                        (a) => a.app_status === 'in-progress'
                      ).length
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>

            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">

              {/* Block Time dialog */}
              <Dialog open={blockTimeOpen} onOpenChange={setBlockTimeOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Block Time
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Block Time</DialogTitle>
                  </DialogHeader>

                  <p className="text-sm text-muted-foreground mb-3">
                    Mark a therapist's time as unavailable for a specific date and range.
                  </p>

                  <div className="space-y-3">

                    {/* Therapist */}
                    <div className="space-y-1">
                      <Label>Therapist (optional)</Label>
                      <Select
                        value={blockForm.therapist_id}
                        onValueChange={(v) => setBlockForm({ ...blockForm, therapist_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All therapists" />
                        </SelectTrigger>
                        <SelectContent>
                          {therapists.map((t) => (
                            <SelectItem key={t.therapist_id} value={String(t.therapist_id)}>
                              {t.first_name} {t.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-1">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={blockForm.date}
                        onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                      />
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>From</Label>
                        <Input
                          type="time"
                          value={blockForm.from}
                          onChange={(e) => setBlockForm({ ...blockForm, from: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>To</Label>
                        <Input
                          type="time"
                          value={blockForm.to}
                          onChange={(e) => setBlockForm({ ...blockForm, to: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                      <Label>Reason (optional)</Label>
                      <Input
                        placeholder="e.g. Lunch break, Meeting..."
                        value={blockForm.reason}
                        onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                      />
                    </div>

                    <Button
                      onClick={handleAddBlock}
                      className="w-full bg-[#694588] hover:bg-[#9e74b9]"
                      disabled={!blockForm.date || !blockForm.from || !blockForm.to}
                    >
                      Add Block
                    </Button>
                  </div>

                  {/* Existing blocks list */}
                  {blockedSlots.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Active Blocks</p>
                      {blockedSlots.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/20 text-sm"
                        >
                          <div>
                            <p className="font-medium text-[#ef4444]">
                              {b.from} – {b.to}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.date}
                              {b.therapist_id ? ` · ${getTherapistName(Number(b.therapist_id))}` : ' · All therapists'}
                              {b.reason ? ` · ${b.reason}` : ''}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-[#ef4444] hover:bg-[#ef4444]/10"
                            onClick={() => handleRemoveBlock(b.id)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={() => setBlockTimeOpen(false)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* View Calendar — mini monthly calendar dialog */}
              <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Monthly Calendar</DialogTitle>
                  </DialogHeader>

                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                        )
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="font-semibold text-sm">
                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                        )
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {(() => {
                      const year = calendarMonth.getFullYear();
                      const month = calendarMonth.getMonth();
                      const firstDay = new Date(year, month, 1).getDay();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const today = new Date();

                      const cells: React.ReactNode[] = [];

                      // Empty cells before first day
                      for (let i = 0; i < firstDay; i++) {
                        cells.push(<div key={`empty-${i}`} />);
                      }

                      for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const hasAppointment = appointments.some((apt) => apt.app_date === dateStr);
                        const isToday =
                          today.getFullYear() === year &&
                          today.getMonth() === month &&
                          today.getDate() === day;
                        const isSelected =
                          currentDate.getFullYear() === year &&
                          currentDate.getMonth() === month &&
                          currentDate.getDate() === day;

                        cells.push(
                          <button
                            key={day}
                            onClick={() => {
                              setCurrentDate(new Date(year, month, day));
                              setCalendarOpen(false);
                            }}
                            className={`relative flex flex-col items-center justify-center h-9 w-full rounded-md text-sm transition-colors
                              ${isSelected ? 'bg-[#694588] text-white font-semibold' : ''}
                              ${isToday && !isSelected ? 'border border-[#694588] text-[#694588] font-semibold' : ''}
                              ${!isSelected && !isToday ? 'hover:bg-muted text-foreground' : ''}
                            `}
                          >
                            {day}
                            {hasAppointment && (
                              <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#694588]'}`} />
                            )}
                          </button>
                        );
                      }

                      return cells;
                    })()}
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Click a day to jump to it in the schedule
                  </p>
                </DialogContent>
              </Dialog>

              {/* Manage Time Slots dialog */}
              <Dialog open={timeSlotsOpen} onOpenChange={setTimeSlotsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Manage Time Slots
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Manage Time Slots</DialogTitle>
                  </DialogHeader>

                  <p className="text-sm text-muted-foreground mb-3">
                    Toggle which time slots are visible in the schedule.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {allTimeSlots.map((slot) => {
                      const isActive = activeSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleSlot(slot)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                            ${isActive
                              ? 'bg-[#694588]/10 border-[#694588] text-[#694588]'
                              : 'bg-muted/40 border-border text-muted-foreground'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {slot}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#694588]' : 'bg-muted-foreground/30'}`} />
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setTimeSlotsOpen(false)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}