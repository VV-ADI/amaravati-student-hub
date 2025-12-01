import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
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
import { toast } from "sonner";

export default function Marks() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const records = JSON.parse(localStorage.getItem("studentRecords") || "[]");
    setStudents(records);
  };

  const loadStudentData = (studentId: string) => {
    const records = JSON.parse(localStorage.getItem("studentRecords") || "[]");
    const student = records.find((s: any) => s.id === studentId);
    setStudentData(student);
  };

  const updateMarks = (subject: string, field: string, value: number) => {
    if (!studentData) return;

    const updatedData = {
      ...studentData,
      marks: {
        ...studentData.marks,
        [subject]: {
          ...studentData.marks[subject],
          [field]: value,
        },
      },
    };

    setStudentData(updatedData);

    const records = JSON.parse(localStorage.getItem("studentRecords") || "[]");
    const updatedRecords = records.map((s: any) =>
      s.id === studentData.id ? updatedData : s
    );
    localStorage.setItem("studentRecords", JSON.stringify(updatedRecords));
    toast.success("Marks updated successfully!");
  };

  const calculateCGPA = () => {
    if (!studentData) return 0;

    const subjects = Object.keys(studentData.marks);
    let totalGradePoints = 0;

    subjects.forEach((subject) => {
      const marks = studentData.marks[subject];
      const total = marks.internal1 + marks.internal2 + marks.external;
      const gradePoint = (total / 125) * 10; // Assuming 125 is max marks
      totalGradePoints += gradePoint;
    });

    return (totalGradePoints / subjects.length).toFixed(2);
  };

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
                        {student.name} ({student.regNumber})
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
              <CardHeader>
                <CardTitle className="font-serif">Marks for {studentData.name}</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {Object.entries(studentData.marks).map(([subject, marks]: [string, any]) => {
                      const total = marks.internal1 + marks.internal2 + marks.external;
                      return (
                        <TableRow key={subject}>
                          <TableCell className="font-medium">{subject}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
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
