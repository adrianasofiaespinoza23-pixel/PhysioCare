import React, { useEffect, useState } from 'react';
import {
  Plus,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Trash2,
  Pencil,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

import { Label } from './ui/label';
import { Input } from './ui/input';

interface StaffMember {
  therapist_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  phone_number: string;
  email: string;
  hire_date: string;
  license_no: string;
  active: boolean;
}

export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingStaff, setEditingStaff] =
    useState<StaffMember | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    phone_number: '',
    email: '',
    hire_date: '',
    license_no: '',
    active: true,
  });

  // =========================
  // FETCH STAFF
  // =========================
  const fetchStaff = async () => {
    try {
      const res = await fetch(
        'http://127.0.0.1:5000/physiotherapists'
      );

      const data = await res.json();

      setStaff(data.physiotherapists || []);
      setLoading(false);

    } catch (err) {
      console.error('Error loading physiotherapists:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // =========================
  // ADD STAFF
  // =========================
  const handleAddStaff = async () => {
    try {
      const res = await fetch(
        'http://127.0.0.1:5000/physiotherapist',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error('Error creating physiotherapist');
      }

      await fetchStaff();

      setFormData({
        first_name: '',
        last_name: '',
        specialization: '',
        phone_number: '',
        email: '',
        hire_date: '',
        license_no: '',
        active: true,
      });

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // DELETE STAFF
  // =========================
  const handleDeleteStaff = async (id: number) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/physiotherapist/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        throw new Error('Error deleting physiotherapist');
      }

      await fetchStaff();

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // UPDATE STAFF
  // =========================
  const handleUpdateStaff = async () => {
    if (!editingStaff) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/physiotherapist/${editingStaff.therapist_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error('Error updating physiotherapist');
      }

      await fetchStaff();

      setEditingStaff(null);

      setFormData({
        first_name: '',
        last_name: '',
        specialization: '',
        phone_number: '',
        email: '',
        hire_date: '',
        license_no: '',
        active: true,
      });

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // HELPERS
  // =========================
  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-[#22c55e]/10 text-[#22c55e]'
      : 'bg-[#ef4444]/10 text-[#ef4444]';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p>Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="mb-1">Staff Management</h1>

          <p className="text-muted-foreground">
            Manage your clinic physiotherapists
          </p>
        </div>

        {/* ADD STAFF DIALOG */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#694588] hover:bg-[#9e74b9]">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">

            <DialogHeader>
              <DialogTitle>
                Add New Physiotherapist
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">

              <div className="space-y-2">
                <Label>First Name</Label>

                <Input
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>

                <Input
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Specialization</Label>

                <Input
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialization: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>

                <Input
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>License Number</Label>

                <Input
                  value={formData.license_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      license_no: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Hire Date</Label>

                <Input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hire_date: e.target.value,
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
                className="bg-[#694588] hover:bg-[#9e74b9]"
                onClick={handleAddStaff}
              >
                Add Staff
              </Button>

            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Total Staff
              </p>

              <h2>{staff.length}</h2>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Active Staff
              </p>

              <h2>
                {staff.filter((s) => s.active).length}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Inactive Staff
              </p>

              <h2>
                {staff.filter((s) => !s.active).length}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Specializations
              </p>

              <h2>
                {
                  new Set(
                    staff.map((s) => s.specialization)
                  ).size
                }
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STAFF GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {staff.map((member) => (
          <Card
            key={member.therapist_id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent className="pt-6">

              <div className="flex items-start gap-4">

                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-[#59217e] text-white text-lg">
                    {member.first_name[0]}
                    {member.last_name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">

                  <div className="flex items-start justify-between mb-2">

                    <div>
                      <h3 className="mb-1">
                        {member.first_name} {member.last_name}
                      </h3>

                      <div className="flex items-center gap-2 mb-2">

                        <Badge className="bg-[#217e6b]/10 text-[#217e6b]">
                          Physiotherapist
                        </Badge>

                        <Badge variant="outline" className="text-xs">
                          {member.specialization}
                        </Badge>

                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingStaff(member);

                          setFormData({
                            first_name: member.first_name,
                            last_name: member.last_name,
                            specialization: member.specialization,
                            phone_number: member.phone_number,
                            email: member.email,
                            hire_date: member.hire_date,
                            license_no: member.license_no,
                            active: member.active,
                          });
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          handleDeleteStaff(member.therapist_id)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                    </div>
                  </div>

                  <div className="space-y-2 mb-4">

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {member.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{member.phone_number}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />

                      <span>
                        Hired: {formatDate(member.hire_date)}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      License: {member.license_no}
                    </div>

                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Status
                      </p>

                      <Badge
                        className={`${getStatusColor(member.active)} mt-1`}
                      >
                        {member.active
                          ? 'Active'
                          : 'Inactive'}
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      className="bg-[#694588] hover:bg-[#9e74b9]"
                    >
                      View Profile
                    </Button>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingStaff}>

        <DialogContent className="max-w-2xl">

          <DialogHeader>
            <DialogTitle>
              Edit Physiotherapist
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">

            <div className="space-y-2">
              <Label>First Name</Label>

              <Input
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>

              <Input
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    last_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Specialization</Label>

              <Input
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specialization: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>

              <Input
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_number: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Email</Label>

              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>License Number</Label>

              <Input
                value={formData.license_no}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    license_no: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Hire Date</Label>

              <Input
                type="date"
                value={formData.hire_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hire_date: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="flex justify-end gap-2">

            <Button
              variant="outline"
              onClick={() => setEditingStaff(null)}
            >
              Cancel
            </Button>

            <Button
              className="bg-[#694588] hover:bg-[#9e74b9]"
              onClick={handleUpdateStaff}
            >
              Save Changes
            </Button>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}