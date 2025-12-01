import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<any>(null);

  useEffect(() => {
    const studentRecords = JSON.parse(localStorage.getItem("studentRecords") || "[]");
    const studentData = studentRecords.find((s: any) => s.id === user?.id);

    if (studentData) {
      setAttendanceData(studentData.attendance);
    }
  }, [user]);

  const calculateOverallAttendance = () => {
    if (!attendanceData) return 0;

    let totalPresent = 0;
    let totalClasses = 0;

    Object.values(attendanceData).forEach((data: any) => {
      totalPresent += data.present;
      totalClasses += data.total;
    });

    return ((totalPresent / totalClasses) * 100).toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif">My Attendance</h1>
          <p className="text-muted-foreground mt-1">View your attendance records</p>
        </div>

        {/* Overall Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <p className="text-5xl font-bold font-serif text-accent mb-2">
                {calculateOverallAttendance()}%
              </p>
              <p className="text-muted-foreground">
                {attendanceData &&
                  `${Object.values(attendanceData).reduce(
                    (acc: number, curr: any) => acc + curr.present,
                    0
                  )} / ${Object.values(attendanceData).reduce(
                    (acc: number, curr: any) => acc + curr.total,
                    0
                  )} classes attended`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Subject-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {attendanceData &&
                Object.entries(attendanceData).map(([subject, data]: [string, any]) => {
                  const percentage = ((data.present / data.total) * 100).toFixed(1);
                  const isLow = parseFloat(percentage) < 75;

                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.present} / {data.total} classes
                          </p>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            isLow ? "text-destructive" : "text-accent-green"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <Progress
                        value={parseFloat(percentage)}
                        className="h-2"
                      />
                      {isLow && (
                        <p className="text-xs text-destructive">
                          ⚠️ Attendance below 75% threshold
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
