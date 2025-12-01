import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardCard } from "@/components/DashboardCard";
import { Users, ClipboardCheck, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgAttendance: 0,
    totalSubjects: 0,
    avgCGPA: "0.00",
  });

  useEffect(() => {
    const studentRecords = JSON.parse(localStorage.getItem("studentRecords") || "[]");
    
    let totalAttendance = 0;
    let totalSubjects = 0;
    let totalCGPA = 0;

    studentRecords.forEach((student: any) => {
      const subjects = Object.keys(student.attendance);
      totalSubjects = subjects.length;
      
      subjects.forEach((subject) => {
        const att = student.attendance[subject];
        totalAttendance += (att.present / att.total) * 100;
      });

      // Calculate CGPA
      let totalMarks = 0;
      Object.values(student.marks).forEach((mark: any) => {
        const total = mark.internal1 + mark.internal2 + mark.external;
        totalMarks += total;
      });
      const avgMarks = totalMarks / subjects.length;
      const cgpa = (avgMarks / 125) * 10; // Assuming 125 is max marks
      totalCGPA += cgpa;
    });

    const avgAtt = studentRecords.length > 0 ? totalAttendance / (studentRecords.length * totalSubjects) : 0;
    const avgCGPA = studentRecords.length > 0 ? totalCGPA / studentRecords.length : 0;

    setStats({
      totalStudents: studentRecords.length,
      avgAttendance: Math.round(avgAtt),
      totalSubjects,
      avgCGPA: avgCGPA.toFixed(2),
    });
  }, []);

  const recentActivities = [
    { action: "Student Added", details: "New student enrolled in CSE", time: "2 hours ago" },
    { action: "Attendance Updated", details: "Attendance marked for Semester 6", time: "5 hours ago" },
    { action: "Marks Updated", details: "Internal marks updated for DS", time: "1 day ago" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of the system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            description="Active students"
            iconColor="text-accent"
          />
          <DashboardCard
            title="Avg Attendance"
            value={`${stats.avgAttendance}%`}
            icon={ClipboardCheck}
            description="Overall attendance"
            iconColor="text-accent-green"
          />
          <DashboardCard
            title="Subjects"
            value={stats.totalSubjects}
            icon={FileText}
            description="Active subjects"
            iconColor="text-accent-brown"
          />
          <DashboardCard
            title="Avg CGPA"
            value={stats.avgCGPA}
            icon={TrendingUp}
            description="Overall performance"
            iconColor="text-accent"
          />
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
