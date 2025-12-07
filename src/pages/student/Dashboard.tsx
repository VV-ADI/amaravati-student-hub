import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardCard } from "@/components/DashboardCard";
import { ClipboardCheck, FileText, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentRecord } from "@/hooks/useStudentRecord";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { record, loading } = useStudentRecord();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!record) {
      return { avgAttendance: 0, totalSubjects: 0, sgpa: 0, classesToday: 4 };
    }

    const subjects = Object.keys(record.attendance);
    let totalAttendance = 0;

    subjects.forEach((subject) => {
      const att = record.attendance[subject];
      if (att.total > 0) {
        totalAttendance += (att.present / att.total) * 100;
      }
    });

    const avgAtt = subjects.length > 0 ? totalAttendance / subjects.length : 0;

    // Calculate SGPA
    let totalMarks = 0;
    const marksSubjects = Object.keys(record.marks);
    marksSubjects.forEach((subject) => {
      const mark = record.marks[subject];
      const total = mark.internal1 + mark.internal2 + mark.external;
      totalMarks += total;
    });
    const avgMarks = marksSubjects.length > 0 ? totalMarks / marksSubjects.length : 0;
    const sgpa = (avgMarks / 125) * 10;

    return {
      avgAttendance: Math.round(avgAtt),
      totalSubjects: Math.max(subjects.length, marksSubjects.length),
      sgpa: parseFloat(sgpa.toFixed(2)),
      classesToday: 4,
    };
  }, [record]);

  const upcomingClasses = [
    { subject: "Discrete Mathematics", time: "10:00 AM - 11:00 AM", room: "Room 301" },
    { subject: "Coding Skills", time: "11:15 AM - 12:15 PM", room: "Lab 2" },
    { subject: "C++ Programming", time: "2:00 PM - 3:00 PM", room: "Lab 4" },
  ];

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
          <h1 className="text-3xl font-bold font-serif">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">Here's your academic overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Attendance"
            value={`${stats.avgAttendance}%`}
            icon={ClipboardCheck}
            description="Overall attendance"
            iconColor="text-accent-green"
          />
          <DashboardCard
            title="Subjects"
            value={stats.totalSubjects}
            icon={FileText}
            description="This semester"
            iconColor="text-accent"
          />
          <DashboardCard
            title="SGPA"
            value={stats.sgpa}
            icon={TrendingUp}
            description="Current semester"
            iconColor="text-accent"
          />
          <DashboardCard
            title="Classes Today"
            value={stats.classesToday}
            icon={Calendar}
            description="Scheduled classes"
            iconColor="text-accent-brown"
          />
        </div>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.map((classItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div>
                    <p className="font-semibold">{classItem.subject}</p>
                    <p className="text-sm text-muted-foreground">{classItem.time}</p>
                  </div>
                  <span className="text-sm font-medium text-accent">{classItem.room}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/student/attendance")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold font-serif">View Attendance</h3>
                  <p className="text-sm text-muted-foreground">Check your attendance records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/student/marks")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-green rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold font-serif">View Marks</h3>
                  <p className="text-sm text-muted-foreground">Check your exam results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
