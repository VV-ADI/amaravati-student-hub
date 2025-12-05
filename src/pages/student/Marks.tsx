import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudentRecord } from "@/hooks/useStudentRecord";

export default function StudentMarks() {
  const { record, loading } = useStudentRecord();

  const calculateSGPA = () => {
    if (!record || !record.marks) return "0.00";

    const subjects = Object.keys(record.marks);
    if (subjects.length === 0) return "0.00";

    let totalGradePoints = 0;

    subjects.forEach((subject) => {
      const marks = record.marks[subject];
      const total = marks.internal1 + marks.internal2 + marks.external;
      const gradePoint = (total / 125) * 10;
      totalGradePoints += gradePoint;
    });

    return (totalGradePoints / subjects.length).toFixed(2);
  };

  const getGrade = (total: number) => {
    const percentage = (total / 125) * 100;
    if (percentage >= 90) return "O";
    if (percentage >= 80) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "B+";
    if (percentage >= 50) return "B";
    return "C";
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

  const marksData = record?.marks || {};
  const hasData = Object.keys(marksData).length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif">My Marks</h1>
          <p className="text-muted-foreground mt-1">View your examination results</p>
        </div>

        {/* SGPA Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Current SGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <p className="text-5xl font-bold font-serif text-accent mb-2">
                {calculateSGPA()}
              </p>
              <p className="text-muted-foreground">Out of 10.00</p>
            </div>
          </CardContent>
        </Card>

        {/* Marks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Subject-wise Marks</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <p className="text-muted-foreground text-center py-8">
                No marks records available yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Internal 1</TableHead>
                    <TableHead>Internal 2</TableHead>
                    <TableHead>External</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(marksData).map(([subject, marks]) => {
                    const total = marks.internal1 + marks.internal2 + marks.external;
                    const grade = getGrade(total);

                    return (
                      <TableRow key={subject}>
                        <TableCell className="font-medium">{subject}</TableCell>
                        <TableCell>{marks.internal1} / 25</TableCell>
                        <TableCell>{marks.internal2} / 25</TableCell>
                        <TableCell>{marks.external} / 75</TableCell>
                        <TableCell className="font-semibold">{total} / 125</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold">
                            {grade}
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
      </div>
    </DashboardLayout>
  );
}
