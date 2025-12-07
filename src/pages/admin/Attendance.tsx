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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SUBJECTS } from "@/lib/constants";

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
  const [selectedSubject, setSelectedSubject] = useState("");
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      
      // Silent update - no toast for every keystroke
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  };

  const updateBulkAttendance = async (field: "present" | "total", increment: number) => {
    if (!selectedSubject || students.length === 0) {
      toast.error("Please select a subject first");
      return;
    }

    try {
      // Update all students' attendance for selected subject
      for (const student of students) {
        const currentAttendance = student.attendance[selectedSubject] || { present: 0, total: 0 };
        const newValue = Math.max(0, currentAttendance[field] + increment);
        
        const updatedAttendance = {
          ...student.attendance,
          [selectedSubject]: {
            ...currentAttendance,
            [field]: newValue,
          },
        };

        await supabase
          .from("student_records")
          .update({ attendance: updatedAttendance })
          .eq("id", student.id);
      }

      await loadStudents();
      toast.success(`Updated ${field} for all students in ${selectedSubject}`);
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

  const allSubjects = [...new Set([
    ...DEFAULT_SUBJECTS,
    ...students.flatMap(s => Object.keys(s.attendance))
  ])];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.reg_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList>
            <TabsTrigger value="individual">Individual Student</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Update</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bulk Attendance Update
                </CardTitle>
                <CardDescription>
                  Update attendance for all students at once for a specific subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Subject</Label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSubject && (
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => updateBulkAttendance("total", 1)}
                      variant="outline"
                    >
                      +1 Total Class (All Students)
                    </Button>
                    <Button 
                      onClick={() => updateBulkAttendance("present", 1)}
                    >
                      +1 Present (All Students)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">All Students Overview</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Reg Number</TableHead>
                      {allSubjects.slice(0, 3).map(subject => (
                        <TableHead key={subject}>{subject}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.reg_number}</TableCell>
                        {allSubjects.slice(0, 3).map(subject => {
                          const att = student.attendance[subject] || { present: 0, total: 0 };
                          const pct = att.total > 0 ? ((att.present / att.total) * 100).toFixed(0) : "0";
                          return (
                            <TableCell key={subject}>
                              <span className={parseFloat(pct) >= 75 ? "text-accent-green" : "text-destructive"}>
                                {att.present}/{att.total} ({pct}%)
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
