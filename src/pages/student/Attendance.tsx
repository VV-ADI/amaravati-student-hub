import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStudentRecord } from "@/hooks/useStudentRecord";

export default function StudentAttendance() {
  const { record, loading } = useStudentRecord();

  const calculateOverallAttendance = () => {
    if (!record || !record.attendance) return "0.0";

    let totalPresent = 0;
    let totalClasses = 0;

    Object.values(record.attendance).forEach((data) => {
      totalPresent += data.present;
      totalClasses += data.total;
    });

    if (totalClasses === 0) return "0.0";
    return ((totalPresent / totalClasses) * 100).toFixed(1);
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

  const attendanceData = record?.attendance || {};
  const hasData = Object.keys(attendanceData).length > 0;

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
                {hasData &&
                  `${Object.values(attendanceData).reduce(
                    (acc, curr) => acc + curr.present,
                    0
                  )} / ${Object.values(attendanceData).reduce(
                    (acc, curr) => acc + curr.total,
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
            {!hasData ? (
              <p className="text-muted-foreground text-center py-8">
                No attendance records available yet.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(attendanceData).map(([subject, data]) => {
                  const percentage = data.total > 0 
                    ? ((data.present / data.total) * 100).toFixed(1) 
                    : "0.0";
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
