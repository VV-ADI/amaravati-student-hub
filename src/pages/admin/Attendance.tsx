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
import { toast } from "sonner";

export default function Attendance() {
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

  const updateAttendance = (subject: string, field: "present" | "total", value: number) => {
    if (!studentData) return;

    const updatedData = {
      ...studentData,
      attendance: {
        ...studentData.attendance,
        [subject]: {
          ...studentData.attendance[subject],
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
    toast.success("Attendance updated successfully!");
  };

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
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">
                Attendance for {studentData.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  {Object.entries(studentData.attendance).map(([subject, data]: [string, any]) => {
                    const percentage = ((data.present / data.total) * 100).toFixed(1);
                    return (
                      <TableRow key={subject}>
                        <TableCell className="font-medium">{subject}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
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
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
