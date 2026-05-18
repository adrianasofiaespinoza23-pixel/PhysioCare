import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';

import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Avatar,
  AvatarFallback,
} from './ui/avatar';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

import { Label } from './ui/label';

import { PatientProfile } from './PatientProfile';

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

export function Patients() {

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);

  const [firstName, setFirstName] =
    useState('');

  const [lastName, setLastName] =
    useState('');

  const [birthDate, setBirthDate] =
    useState('');

  const [gender, setGender] =
    useState('');

  const [phoneNumber, setPhoneNumber] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [address, setAddress] =
    useState('');



  const fetchPatients = async () => {

    try {

      const res = await fetch(
        'http://127.0.0.1:5000/patients'
      );

      const data = await res.json();

      setPatients(data.patients);

    } catch (error) {

      console.error(
        'Error fetching patients:',
        error
      );
    }
  };



  useEffect(() => {
    fetchPatients();
  }, []);



  const resetForm = () => {

    setFirstName('');
    setLastName('');
    setBirthDate('');
    setGender('');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
  };



  const createPatient = async () => {

    const newPatient = {
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      gender,
      phone_number: phoneNumber,
      email,
      address,
    };

    try {

      const response = await fetch(
        'http://127.0.0.1:5000/patient',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(
            newPatient
          ),
        }
      );

      const data =
        await response.json();

      console.log(data);

      resetForm();

      fetchPatients();

    } catch (error) {

      console.error(
        'Error creating patient:',
        error
      );
    }
  };



  const openEditDialog = (
    patient: Patient
  ) => {

    setEditingPatient(patient);

    setFirstName(patient.first_name);

    setLastName(patient.last_name);

    setBirthDate(
      patient.birth_date
    );

    setGender(patient.gender);

    setPhoneNumber(
      patient.phone_number
    );

    setEmail(patient.email);

    setAddress(patient.address);

    setEditDialogOpen(true);
  };



  const updatePatient = async () => {

    if (!editingPatient) return;

    const updatedPatient = {
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      gender,
      phone_number: phoneNumber,
      email,
      address,
    };

    try {

      const response = await fetch(
        `http://127.0.0.1:5000/patient/${editingPatient.patient_id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            updatedPatient
          ),
        }
      );

      const data =
        await response.json();

      console.log(data);

      fetchPatients();

      setEditDialogOpen(false);

      setEditingPatient(null);

      resetForm();

    } catch (error) {

      console.error(
        'Error updating patient:',
        error
      );
    }
  };



  const deletePatient = async (
    id: number
  ) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:5000/patient/${id}`,
        {
          method: 'DELETE',
        }
      );

      const data =
        await response.json();

      console.log(data);

      fetchPatients();

    } catch (error) {

      console.error(
        'Error deleting patient:',
        error
      );
    }
  };



  const getAge = (
    birthDate: string
  ) => {

    const birth = new Date(
      birthDate
    );

    const diff =
      Date.now() -
      birth.getTime();

    return Math.floor(
      diff /
        (
          1000 *
          60 *
          60 *
          24 *
          365.25
        )
    );
  };



  const filteredPatients =
    patients.filter((patient) =>
      `${patient.first_name} ${patient.last_name}`
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        ) ||

      patient.email
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        ) ||

      patient.phone_number.includes(
        searchQuery
      )
    );



  return (
    <>
      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h1 className="mb-1">
              Patient Management
            </h1>

            <p className="text-muted-foreground">
              Manage your patient
              records and information
            </p>

          </div>

          {/* ADD PATIENT */}

          <Dialog>

            <DialogTrigger asChild>

              <Button className="bg-[#694588] hover:bg-[#9e74b9]">

                <Plus className="w-4 h-4 mr-2" />

                Add Patient

              </Button>

            </DialogTrigger>

            <DialogContent className="max-w-2xl">

              <DialogHeader>

                <DialogTitle>
                  Add New Patient
                </DialogTitle>

              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">

                <div className="space-y-2">

                  <Label>
                    First Name
                  </Label>

                  <Input
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(
                        e.target.value
                      )
                    }
                    placeholder="John"
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    Last Name
                  </Label>

                  <Input
                    value={lastName}
                    onChange={(e) =>
                      setLastName(
                        e.target.value
                      )
                    }
                    placeholder="Doe"
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    Birth Date
                  </Label>

                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) =>
                      setBirthDate(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    Gender
                  </Label>

                  <Input
                    value={gender}
                    onChange={(e) =>
                      setGender(
                        e.target.value
                      )
                    }
                    placeholder="M / F"
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    Phone
                  </Label>

                  <Input
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(
                        e.target.value
                      )
                    }
                    placeholder="0999999999"
                  />

                </div>

                <div className="space-y-2">

                  <Label>
                    Email
                  </Label>

                  <Input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="email@example.com"
                  />

                </div>

                <div className="col-span-2 space-y-2">

                  <Label>
                    Address
                  </Label>

                  <Input
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    placeholder="Street..."
                  />

                </div>

              </div>

              <div className="flex justify-end gap-2">

                <Button variant="outline">
                  Cancel
                </Button>

                <Button
                  onClick={createPatient}
                  className="bg-[#694588] hover:bg-[#9e74b9]"
                >
                  Add Patient
                </Button>

              </div>

            </DialogContent>

          </Dialog>

        </div>

        {/* SEARCH */}

        <Card>

          <CardContent className="pt-6">

            <div className="relative">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                className="pl-9"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
              />

            </div>

          </CardContent>

        </Card>

        {/* TABLE */}

        <Card>

          <CardHeader>

            <CardTitle>
              All Patients (
              {
                filteredPatients.length
              })
            </CardTitle>

          </CardHeader>

          <CardContent>

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>
                    Patient
                  </TableHead>

                  <TableHead>
                    Age
                  </TableHead>

                  <TableHead>
                    Gender
                  </TableHead>

                  <TableHead>
                    Contact
                  </TableHead>

                  <TableHead>
                    Address
                  </TableHead>

                  <TableHead className="text-right">
                    Actions
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {filteredPatients.map(
                  (patient) => (

                    <TableRow
                      key={
                        patient.patient_id
                      }
                    >

                      <TableCell>

                        <div className="flex items-center gap-3">

                          <Avatar>

                            <AvatarFallback className="bg-[#217e6b]/10 text-[#217e6b]">

                              {
                                patient
                                  .first_name[0]
                              }

                              {
                                patient
                                  .last_name[0]
                              }

                            </AvatarFallback>

                          </Avatar>

                          <div>

                            <p className="font-medium">

                              {
                                patient.first_name
                              }{' '}

                              {
                                patient.last_name
                              }

                            </p>

                            <p className="text-sm text-muted-foreground">

                              ID:{' '}

                              {
                                patient.patient_id
                              }

                            </p>

                          </div>

                        </div>

                      </TableCell>

                      <TableCell>

                        {getAge(
                          patient.birth_date
                        )}

                      </TableCell>

                      <TableCell>

                        {
                          patient.gender
                        }

                      </TableCell>

                      <TableCell>

                        <div className="space-y-1">

                          <p className="text-sm">

                            {
                              patient.phone_number
                            }

                          </p>

                          <p className="text-sm text-muted-foreground">

                            {
                              patient.email
                            }

                          </p>

                        </div>

                      </TableCell>

                      <TableCell>

                        {
                          patient.address
                        }

                      </TableCell>

                      <TableCell className="text-right">

                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedPatient(
                                patient
                              )
                            }
                          >
                            View
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditDialog(
                                patient
                              )
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              deletePatient(
                                patient.patient_id
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                        </div>

                      </TableCell>

                    </TableRow>
                  )
                )}

              </TableBody>

            </Table>

          </CardContent>

        </Card>

      </div>



      {/* EDIT PATIENT */}

      <Dialog
        open={editDialogOpen}
        onOpenChange={
          setEditDialogOpen
        }
      >

        <DialogContent className="max-w-2xl">

          <DialogHeader>

            <DialogTitle>
              Edit Patient
            </DialogTitle>

          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">

            <div className="space-y-2">

              <Label>
                First Name
              </Label>

              <Input
                value={firstName}
                onChange={(e) =>
                  setFirstName(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Last Name
              </Label>

              <Input
                value={lastName}
                onChange={(e) =>
                  setLastName(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Birth Date
              </Label>

              <Input
                type="date"
                value={birthDate}
                onChange={(e) =>
                  setBirthDate(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Gender
              </Label>

              <Input
                value={gender}
                onChange={(e) =>
                  setGender(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Phone
              </Label>

              <Input
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="space-y-2">

              <Label>
                Email
              </Label>

              <Input
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-span-2 space-y-2">

              <Label>
                Address
              </Label>

              <Input
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <div className="flex justify-end gap-2">

            <Button
              variant="outline"
              onClick={() =>
                setEditDialogOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={updatePatient}
              className="bg-[#694588] hover:bg-[#9e74b9]"
            >
              Save Changes
            </Button>

          </div>

        </DialogContent>

      </Dialog>



      {/* PROFILE */}

      {selectedPatient && (

        <PatientProfile
          patient={selectedPatient}
          onClose={() =>
            setSelectedPatient(null)
          }
        />

      )}
    </>
  );
}

