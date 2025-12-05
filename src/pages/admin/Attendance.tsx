import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceData {
  [subject: string]: { present: number; total: number };
}

interface Student {
  id: string;
  name: string;
  reg_number: string;
  attendance: AttendanceData;
}

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("student_records")
        .select("id, name, reg_number, attendance")
        .order("name");

      if (error) throw error;
      
      const formattedData = (data || []).map(s => ({
        ...s,
        attendance: (s.attendance as AttendanceData) || {}
      }));
      
      setStudents(formattedData);
    } catch (error: any) {
      toast.error("Failed to load students: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudentData(student || null);
  };

  const updateAttendance = async (subject: string, field: "present" | "total", value: number) => {
    if (!studentData) return;

    const updatedAttendance = {
      ...studentData.attendance,
      [subject]: {
        ...studentData.attendance[subject],
        [field]: value,
      },
    };

    try {
      const { error } = await supabase
        .from("student_records")
        .update({ attendance: updatedAttendance })
        .eq("id", studentData.id);

      if (error) throw error;

      setStudentData({ ...studentData, attendance: updatedAttendance });
      
      // Update local students array
      setStudents(students.map(s => 
        s.id === studentData.id ? { ...s, attendance: updatedAttendance } : s
      ));
      
      toast.success("Attendance updated!");
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  };

  const addSubject = async () => {
    if (!studentData || !newSubject.trim()) return;

    const updatedAttendance = {
      ...studentData.attendance,
      [newSubject.trim()]: { present: 0, total: 0 },
    };

    try {
      const { error } = await supabase
        .from("student_records")
        .update({ attendance: updatedAttendance })
        .eq("id", studentData.id);

      if (error) throw error;

      setStudentData({ ...studentData, attendance: updatedAttendance });
      setStudents(students.map(s => 
        s.id === studentData.id ? { ...s, attendance: updatedAttendance } : s
      ));
      
      setNewSubject("");
      setDialogOpen(false);
      toast.success("Subject added!");
    } catch (error: any) {
      toast.error("Failed to add subject: " + error.message);
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
        <div>
          <h1 className="text-3xl font-bold font-serif">Manage Attendance</h1>
          <p className="text-muted-foreground mt-1">Update student attendance records</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Select Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={(value) => {
                    setSelectedStudent(value);
                    loadStudentData(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.reg_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {studentData && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif">
                Attendance for {studentData.name}
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Subject Name</Label>
                      <Input
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g., Data Structures"
                      />
                    </div>
                    <Button onClick={addSubject} className="w-full">
                      Add Subject
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {Object.keys(studentData.attendance).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No subjects added yet. Click "Add Subject" to get started.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Classes Present</TableHead>
                      <TableHead>Total Classes</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(studentData.attendance).map(([subject, data]) => {
                      const percentage = data.total > 0 
                        ? ((data.present / data.total) * 100).toFixed(1) 
                        : "0.0";
                      return (
                        <TableRow key={subject}>
                          <TableCell className="font-medium">{subject}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={data.present}
                              onChange={(e) =>
                                updateAttendance(subject, "present", parseInt(e.target.value) || 0)
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={data.total}
                              onChange={(e) =>
                                updateAttendance(subject, "total", parseInt(e.target.value) || 0)
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                parseFloat(percentage) >= 75
                                  ? "text-accent-green"
                                  : "text-destructive"
                              }`}
                            >
                              {percentage}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
