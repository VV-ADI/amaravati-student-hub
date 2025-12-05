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

interface MarksData {
  [subject: string]: { internal1: number; internal2: number; external: number };
}

interface Student {
  id: string;
  name: string;
  reg_number: string;
  marks: MarksData;
}

export default function Marks() {
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
        .select("id, name, reg_number, marks")
        .order("name");

      if (error) throw error;
      
      const formattedData = (data || []).map(s => ({
        ...s,
        marks: (s.marks as MarksData) || {}
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

  const updateMarks = async (subject: string, field: string, value: number) => {
    if (!studentData) return;

    const updatedMarks = {
      ...studentData.marks,
      [subject]: {
        ...studentData.marks[subject],
        [field]: value,
      },
    };

    try {
      const { error } = await supabase
        .from("student_records")
        .update({ marks: updatedMarks })
        .eq("id", studentData.id);

      if (error) throw error;

      setStudentData({ ...studentData, marks: updatedMarks });
      setStudents(students.map(s => 
        s.id === studentData.id ? { ...s, marks: updatedMarks } : s
      ));
      
      toast.success("Marks updated!");
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  };

  const addSubject = async () => {
    if (!studentData || !newSubject.trim()) return;

    const updatedMarks = {
      ...studentData.marks,
      [newSubject.trim()]: { internal1: 0, internal2: 0, external: 0 },
    };

    try {
      const { error } = await supabase
        .from("student_records")
        .update({ marks: updatedMarks })
        .eq("id", studentData.id);

      if (error) throw error;

      setStudentData({ ...studentData, marks: updatedMarks });
      setStudents(students.map(s => 
        s.id === studentData.id ? { ...s, marks: updatedMarks } : s
      ));
      
      setNewSubject("");
      setDialogOpen(false);
      toast.success("Subject added!");
    } catch (error: any) {
      toast.error("Failed to add subject: " + error.message);
    }
  };

  const calculateCGPA = () => {
    if (!studentData || !studentData.marks) return "0.00";

    const subjects = Object.keys(studentData.marks);
    if (subjects.length === 0) return "0.00";

    let totalGradePoints = 0;

    subjects.forEach((subject) => {
      const marks = studentData.marks[subject];
      const total = marks.internal1 + marks.internal2 + marks.external;
      const gradePoint = (total / 125) * 10;
      totalGradePoints += gradePoint;
    });

    return (totalGradePoints / subjects.length).toFixed(2);
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
          <h1 className="text-3xl font-bold font-serif">Manage Marks & CGPA</h1>
          <p className="text-muted-foreground mt-1">Update student marks and calculate CGPA</p>
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
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif">Marks for {studentData.name}</CardTitle>
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
                {Object.keys(studentData.marks).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No subjects added yet. Click "Add Subject" to get started.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Internal 1 (25)</TableHead>
                        <TableHead>Internal 2 (25)</TableHead>
                        <TableHead>External (75)</TableHead>
                        <TableHead>Total (125)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(studentData.marks).map(([subject, marks]) => {
                        const total = marks.internal1 + marks.internal2 + marks.external;
                        return (
                          <TableRow key={subject}>
                            <TableCell className="font-medium">{subject}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="25"
                                value={marks.internal1}
                                onChange={(e) =>
                                  updateMarks(subject, "internal1", parseInt(e.target.value) || 0)
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="25"
                                value={marks.internal2}
                                onChange={(e) =>
                                  updateMarks(subject, "internal2", parseInt(e.target.value) || 0)
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="75"
                                value={marks.external}
                                onChange={(e) =>
                                  updateMarks(subject, "external", parseInt(e.target.value) || 0)
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell className="font-semibold">{total}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Current CGPA</p>
                    <p className="text-6xl font-bold font-serif text-accent">
                      {calculateCGPA()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Out of 10.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
