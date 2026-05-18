import React, { useEffect, useState } from 'react';

import {
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Pill,
  Activity,
  Clipboard,
  X,
  Loader2,
} from 'lucide-react';

import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

// ─────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────

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

interface Appointment {
  appointment_id: number;
  app_date: string;
  app_time: string;
  app_status: string;
  notes: string;
  therapist_name?: string;
  type?: string;
}

interface TreatmentPlan {
  plan_id: number;
  diagnosis: string;
  start_date: string;
  end_date: string;
  frequency: string;
  plan_status: string;
}

interface MedicalHistory {
  history_id: number;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  therapist_name?: string;
}

interface Medication {
  medication_id: number;
  medication_name: string;
  dosage: string;
  status: string;
}

interface Billing {
  billing_id: number;
  amount: number;
  payment_status: string;
  billing_date?: string;
}

interface PatientProfileProps {
  patient: Patient;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function PatientProfile({
  patient,
  onClose,
}: PatientProfileProps) {

  // ───────────────────────────────────────────────────────────
  // STATES
  // ───────────────────────────────────────────────────────────

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [treatmentPlans, setTreatmentPlans] =
    useState<TreatmentPlan[]>([]);

  const [medicalHistory, setMedicalHistory] =
    useState<MedicalHistory[]>([]);


  const [billings, setBillings] =
    useState<Billing[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ───────────────────────────────────────────────────────────
  // FETCH DATA
  // ───────────────────────────────────────────────────────────

  useEffect(() => {

    const fetchPatientData = async () => {

      try {

        setLoading(true);
        setError("");

        const [
          appointmentsRes,
          treatmentsRes,
          historyRes,
          billingsRes,
        ] = await Promise.all([
          fetch(
            `http://127.0.0.1:5000/appointments/patient/${patient.patient_id}`
          ),

          fetch(
            `http://127.0.0.1:5000/treatment_plans/patient/${patient.patient_id}`
          ),

          fetch(
            `http://127.0.0.1:5000/medical_history/patient/${patient.patient_id}`
          ),

          fetch(
            `http://127.0.0.1:5000/billings/patient/${patient.patient_id}`
          ),
        ]);

        const appointmentsData =
          await appointmentsRes.json();

        const treatmentsData =
          await treatmentsRes.json();

        const historyData =
          await historyRes.json();


        const billingsData =
          await billingsRes.json();

        setAppointments(
          appointmentsData.appointments || []
        );

        setTreatmentPlans(
          treatmentsData.treatment_plans || []
        );

        setMedicalHistory(
          historyData.medical_history || []
        );


        setBillings(
          billingsData.billings || []
        );

      } catch (err) {

        console.error(err);

        setError(
          "Failed to load patient information."
        );

      } finally {

        setLoading(false);
      }
    };

    fetchPatientData();

  }, [patient.patient_id]);

  // ───────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────

  const getAge = (birthDate: string) => {

    const birth = new Date(birthDate);

    const diff =
      Date.now() - birth.getTime();

    return Math.floor(
      diff /
      (1000 * 60 * 60 * 24 * 365.25)
    );
  };

  // ───────────────────────────────────────────────────────────
  // LOADING
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

        <div className="bg-background rounded-xl p-8 flex flex-col items-center gap-4">

          <Loader2 className="w-10 h-10 animate-spin text-[#217e6b]" />

          <p className="text-muted-foreground">
            Loading patient profile...
          </p>

        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // ERROR
  // ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

        <div className="bg-background rounded-xl p-8 max-w-md w-full text-center">

          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />

          <h2 className="text-lg font-semibold mb-2">
            Error
          </h2>

          <p className="text-muted-foreground mb-4">
            {error}
          </p>

          <Button onClick={onClose}>
            Close
          </Button>

        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (

    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex overflow-hidden">

        {/* LEFT SIDEBAR */}
        <div className="w-80 bg-card border-r border-border p-6 overflow-y-auto">

          <div className="flex justify-between items-start mb-6">

            <h3 className="font-semibold">
              Patient Profile
            </h3>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* AVATAR */}
          <div className="flex flex-col items-center mb-6">

            <Avatar className="w-24 h-24 mb-3">

              <AvatarFallback className="bg-[#217e6b] text-white text-2xl">

                {patient.first_name[0]}
                {patient.last_name[0]}

              </AvatarFallback>

            </Avatar>

            <h3 className="text-center mb-1">

              {patient.first_name} {patient.last_name}

            </h3>

            <p className="text-sm text-muted-foreground">

              ID: {String(patient.patient_id).padStart(6, '0')}

            </p>

          </div>

          {/* PATIENT DETAILS */}
          <div className="space-y-4">

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Phone
              </p>

              <p className="text-sm">
                {patient.phone_number}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Gender
              </p>

              <p className="text-sm">
                {patient.gender}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Date of Birth
              </p>

              <p className="text-sm">
                {patient.birth_date}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Age
              </p>

              <p className="text-sm">
                {getAge(patient.birth_date)} Years
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Email
              </p>

              <p className="text-sm truncate">
                {patient.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Address
              </p>

              <p className="text-sm">
                {patient.address}
              </p>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 space-y-2">

            <Button className="w-full bg-[#217e6b] hover:bg-[#2a9d85]">

              <Calendar className="w-4 h-4 mr-2" />

              Book Appointment

            </Button>

            <Button variant="outline" className="w-full">

              <Phone className="w-4 h-4 mr-2" />

              Call Patient

            </Button>

            <Button variant="outline" className="w-full">

              <Mail className="w-4 h-4 mr-2" />

              Send Email

            </Button>

          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 overflow-y-auto">

          <Tabs
            defaultValue="summary"
            className="h-full flex flex-col"
          >

            <div className="border-b border-border px-6 pt-6">

              <TabsList className="bg-transparent border-b-0">

                <TabsTrigger value="summary">
                  Summary
                </TabsTrigger>

                <TabsTrigger value="timeline">
                  Timeline
                </TabsTrigger>

                <TabsTrigger value="treatments">
                  Treatments
                </TabsTrigger>

                <TabsTrigger value="billing">
                  Billing
                </TabsTrigger>

              </TabsList>
            </div>

            <div className="flex-1 p-6">

              {/* SUMMARY */}
              <TabsContent
                value="summary"
                className="mt-0 space-y-4"
              >

                <Accordion
                  type="multiple"
                  defaultValue={[
                    'medical-history',
                  ]}
                  className="space-y-2"
                >

                  {/* MEDICAL HISTORY */}
                  <AccordionItem
                    value="medical-history"
                    className="border border-border rounded-lg px-4"
                  >

                    <AccordionTrigger>

                      <div className="flex items-center gap-2">

                        <Clipboard className="w-4 h-4 text-[#217e6b]" />

                        <span>
                          Past Medical Visits
                        </span>

                      </div>

                    </AccordionTrigger>

                    <AccordionContent>

                      <div className="space-y-4 pt-2">

                        {medicalHistory.length > 0 ? (

                          medicalHistory.map((visit) => (

                            <div
                              key={visit.history_id}
                              className="p-4 rounded-lg bg-accent/50 space-y-2"
                            >

                              <div className="flex items-center justify-between">

                                <p className="font-medium">
                                  Medical Visit
                                </p>

                                <Badge variant="outline">
                                  {visit.visit_date}
                                </Badge>

                              </div>

                              <p className="text-sm text-muted-foreground">

                                {visit.therapist_name || "Physiotherapist"}

                              </p>

                              <div className="text-sm">

                                <p className="font-medium mb-1">
                                  Diagnosis:
                                </p>

                                <p className="text-muted-foreground">
                                  {visit.diagnosis}
                                </p>

                              </div>

                              <div className="text-sm">

                                <p className="font-medium mb-1">
                                  Treatment:
                                </p>

                                <p className="text-muted-foreground">
                                  {visit.treatment}
                                </p>

                              </div>

                            </div>
                          ))

                        ) : (

                          <p className="text-muted-foreground text-sm">
                            No medical history found
                          </p>

                        )}

                      </div>

                    </AccordionContent>

                  </AccordionItem>


                  {/* TREATMENT PLAN */}
                  <AccordionItem
                    value="treatment-plan"
                    className="border rounded-lg px-4"
                  >

                    <AccordionTrigger>

                      <div className="flex items-center gap-2">

                        <Activity className="w-4 h-4 text-[#217e6b]" />

                        <span>
                          Treatment Plan
                        </span>

                      </div>

                    </AccordionTrigger>

                    <AccordionContent>

                      <div className="space-y-2 pt-2">

                        {treatmentPlans.length > 0 ? (

                          treatmentPlans.map((plan) => (

                            <div
                              key={plan.plan_id}
                              className="p-4 rounded-lg bg-accent/50"
                            >

                              <div className="flex justify-between">

                                <div>

                                  <p className="font-medium">
                                    {plan.diagnosis}
                                  </p>

                                  <p className="text-sm text-muted-foreground">

                                    {plan.start_date} → {plan.end_date}

                                  </p>

                                </div>

                                <Badge>
                                  {plan.plan_status}
                                </Badge>

                              </div>

                              <p className="text-sm mt-2">
                                Frequency: {plan.frequency}
                              </p>

                            </div>
                          ))

                        ) : (

                          <p className="text-muted-foreground text-sm">
                            No treatments found
                          </p>

                        )}

                      </div>

                    </AccordionContent>

                  </AccordionItem>

                  {/* UPCOMING APPOINTMENTS */}
                  <AccordionItem
                    value="appointments"
                    className="border rounded-lg px-4"
                  >

                    <AccordionTrigger>

                      <div className="flex items-center gap-2">

                        <Calendar className="w-4 h-4 text-[#217e6b]" />

                        <span>
                          Upcoming Appointments
                        </span>

                      </div>

                    </AccordionTrigger>

                    <AccordionContent>

                      <div className="space-y-2 pt-2">

                        {appointments.length > 0 ? (

                          appointments.map((apt) => (

                            <div
                              key={apt.appointment_id}
                              className="p-3 rounded-lg bg-accent/50 flex justify-between"
                            >

                              <div>

                                <p className="font-medium">
                                  {apt.type || "Appointment"}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                  {apt.therapist_name || "Physiotherapist"}
                                </p>

                              </div>

                              <div className="text-right">

                                <p>{apt.app_date}</p>

                                <p className="text-sm text-muted-foreground">
                                  {apt.app_time}
                                </p>

                              </div>

                            </div>
                          ))

                        ) : (

                          <p className="text-muted-foreground text-sm">
                            No appointments found
                          </p>

                        )}

                      </div>

                    </AccordionContent>

                  </AccordionItem>

                </Accordion>

              </TabsContent>

              {/* TIMELINE */}
              <TabsContent value="timeline">

                <div className="space-y-4">

                  <h3>Patient Timeline</h3>

                  <div className="relative border-l-2 border-border pl-6 space-y-6">

                    {medicalHistory.length > 0 ? (

                      medicalHistory.map((visit) => (

                        <div
                          key={visit.history_id}
                          className="relative"
                        >

                          <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-[#217e6b] border-4 border-background" />

                          <div className="p-4 rounded-lg border border-border">

                            <div className="flex items-center justify-between mb-2">

                              <p className="font-medium">
                                Medical Visit
                              </p>

                              <Badge variant="outline">
                                {visit.visit_date}
                              </Badge>

                            </div>

                            <p className="text-sm">
                              {visit.treatment}
                            </p>

                          </div>

                        </div>
                      ))

                    ) : (

                      <p className="text-muted-foreground text-sm">
                        No timeline records found
                      </p>

                    )}

                  </div>

                </div>

              </TabsContent>

              {/* TREATMENTS */}
              <TabsContent value="treatments">

                <div className="space-y-4">

                  <div className="flex items-center justify-between">

                    <h3>Treatment History</h3>

                    <p className="text-sm text-muted-foreground">

                      {treatmentPlans.length} Treatments

                    </p>

                  </div>

                  <div className="space-y-3">

                    {treatmentPlans.length > 0 ? (

                      treatmentPlans.map((plan) => (

                        <div
                          key={plan.plan_id}
                          className="p-4 rounded-lg border border-border"
                        >

                          <div className="flex justify-between items-start">

                            <div>

                              <p className="font-medium">
                                {plan.diagnosis}
                              </p>

                              <p className="text-sm text-muted-foreground mt-1">

                                {plan.start_date} → {plan.end_date}

                              </p>

                              <p className="text-sm mt-2">
                                Frequency: {plan.frequency}
                              </p>

                            </div>

                            <Badge>
                              {plan.plan_status}
                            </Badge>

                          </div>

                        </div>
                      ))

                    ) : (

                      <div className="text-center py-12 text-muted-foreground">
                        No treatments found
                      </div>

                    )}

                  </div>

                </div>

              </TabsContent>

              {/* BILLING */}
              <TabsContent value="billing">

                <div className="space-y-4">

                  <h3>Billing & Payments</h3>

                  {billings.length > 0 ? (

                    <div className="space-y-3">

                      {billings.map((bill) => (

                        <div
                          key={bill.billing_id}
                          className="p-4 rounded-lg border border-border flex items-center justify-between"
                        >

                          <div>

                            <p className="font-medium">
                              ${bill.amount}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {bill.billing_date || "Billing Record"}
                            </p>

                          </div>

                          <Badge>
                            {bill.payment_status}
                          </Badge>

                        </div>
                      ))}

                    </div>

                  ) : (

                    <div className="text-center py-12 text-muted-foreground">
                      No billing records found
                    </div>

                  )}

                </div>

              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}