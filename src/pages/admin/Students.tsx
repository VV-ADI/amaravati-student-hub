import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { studentFormSchema, formatZodErrors } from "@/lib/validations";
import { getDefaultAttendance, getDefaultMarks } from "@/lib/constants";

interface Student {
  id: string;
  user_id: string;
  reg_number: string;
  name: string;
  department: string | null;
  semester: number | null;
  email: string | null;
  phone: string | null;
  is_placeholder: boolean;
}

interface FormData {
  name: string;
  reg_number: string;
  department: string;
  semester: string;
  email: string;
  phone: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    reg_number: "",
    department: "",
    semester: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("student_records")
        .select("*")
        .order("name");

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast.error("Failed to load students: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const result = studentFormSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      toast.error(formatZodErrors(result.error));
      return false;
    }
    
    setFormErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingStudent) {
        // Update existing student
        const { error } = await supabase
          .from("student_records")
          .update({
            name: formData.name.trim(),
            reg_number: formData.reg_number.trim().toUpperCase(),
            department: formData.department.trim() || null,
            semester: formData.semester ? parseInt(formData.semester) : null,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
          })
          .eq("id", editingStudent.id);

        if (error) throw error;
        toast.success("Student updated successfully!");
      } else {
        // For new students created by admin, mark as placeholder with default subjects
        const { error } = await supabase
          .from("student_records")
          .insert({
            user_id: crypto.randomUUID(), // Placeholder UUID
            name: formData.name.trim(),
            reg_number: formData.reg_number.trim().toUpperCase(),
            department: formData.department.trim() || null,
            semester: formData.semester ? parseInt(formData.semester) : null,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            attendance: getDefaultAttendance(),
            marks: getDefaultMarks(),
            is_placeholder: true, // Mark as admin-created placeholder
          });

        if (error) throw error;
        toast.success("Student record created with default subjects!");
      }

      loadStudents();
      setDialogOpen(false);
      setEditingStudent(null);
      setFormData({
        name: "",
        reg_number: "",
        department: "",
        semester: "",
        email: "",
        phone: "",
      });
      setFormErrors({});
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("student_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
      loadStudents();
      toast.success("Student deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif">Manage Students</h1>
            <p className="text-muted-foreground mt-1">Add, edit, or remove student records</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { 
                setEditingStudent(null); 
                setFormData({
                  name: "",
                  reg_number: "",
                  department: "",
                  semester: "",
                  email: "",
                  phone: "",
                });
                setFormErrors({});
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingStudent ? "Edit Student" : "Add New Student"}
                </DialogTitle>
                <DialogDescription>
                  {editingStudent 
                    ? "Update the student details below" 
                    : "New students will be created with default subjects (Discrete Mathematics, Coding Skills, C++ Programming)"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={formErrors.name ? "border-destructive" : ""}
                    />
                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg_number">Registration Number *</Label>
                    <Input
                      id="reg_number"
                      value={formData.reg_number}
                      onChange={(e) => handleInputChange("reg_number", e.target.value)}
                      className={formErrors.reg_number ? "border-destructive" : ""}
                    />
                    {formErrors.reg_number && <p className="text-sm text-destructive">{formErrors.reg_number}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className={formErrors.department ? "border-destructive" : ""}
                    />
                    {formErrors.department && <p className="text-sm text-destructive">{formErrors.department}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.semester}
                      onChange={(e) => handleInputChange("semester", e.target.value)}
                      className={formErrors.semester ? "border-destructive" : ""}
                    />
                    {formErrors.semester && <p className="text-sm text-destructive">{formErrors.semester}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={formErrors.email ? "border-destructive" : ""}
                    />
                    {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={formErrors.phone ? "border-destructive" : ""}
                    />
                    {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingStudent ? "Update" : "Add"} Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Student List</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, reg number, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.reg_number}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.department || "-"}</TableCell>
                      <TableCell>{student.semester || "-"}</TableCell>
                      <TableCell>{student.email || "-"}</TableCell>
                      <TableCell>
                        {student.is_placeholder ? (
                          <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Placeholder
                          </Badge>
                        ) : (
                          <Badge variant="default">Registered</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingStudent(student);
                              setFormData({
                                name: student.name,
                                reg_number: student.reg_number,
                                department: student.department || "",
                                semester: student.semester?.toString() || "",
                                email: student.email || "",
                                phone: student.phone || "",
                              });
                              setFormErrors({});
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
