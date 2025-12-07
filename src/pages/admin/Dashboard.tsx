import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardCard } from "@/components/DashboardCard";
import { Users, ClipboardCheck, FileText, TrendingUp, UserPlus, BookOpen, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceData {
  [subject: string]: { present: number; total: number };
}

interface MarksData {
  [subject: string]: { internal1: number; internal2: number; external: number };
}

interface StudentRecord {
  id: string;
  attendance: AttendanceData;
  marks: MarksData;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgAttendance: 0,
    totalSubjects: 0,
    avgCGPA: "0.00",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: students, error } = await supabase
          .from("student_records")
          .select("*");

        if (error) throw error;

        if (!students || students.length === 0) {
          setStats({
            totalStudents: 0,
            avgAttendance: 0,
            totalSubjects: 0,
            avgCGPA: "0.00",
          });
          return;
        }

        let totalAttendance = 0;
        let totalSubjects = 0;
        let totalCGPA = 0;
        let attendanceCount = 0;

        students.forEach((student) => {
          const attendance = (student.attendance as AttendanceData) || {};
          const marks = (student.marks as MarksData) || {};
          const subjects = Object.keys(attendance);
          
          if (subjects.length > totalSubjects) {
            totalSubjects = subjects.length;
          }

          subjects.forEach((subject) => {
            const att = attendance[subject];
            if (att && att.total > 0) {
              totalAttendance += (att.present / att.total) * 100;
              attendanceCount++;
            }
          });

          // Calculate CGPA
          const marksSubjects = Object.keys(marks);
          if (marksSubjects.length > 0) {
            let studentTotalMarks = 0;
            marksSubjects.forEach((subject) => {
              const mark = marks[subject];
              const total = mark.internal1 + mark.internal2 + mark.external;
              studentTotalMarks += total;
            });
            const avgMarks = studentTotalMarks / marksSubjects.length;
            const cgpa = (avgMarks / 125) * 10;
            totalCGPA += cgpa;
          }
        });

        const avgAtt = attendanceCount > 0 ? totalAttendance / attendanceCount : 0;
        const avgCGPA = students.length > 0 ? totalCGPA / students.length : 0;

        setStats({
          totalStudents: students.length,
          avgAttendance: Math.round(avgAtt),
          totalSubjects,
          avgCGPA: avgCGPA.toFixed(2),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recentActivities = [
    { action: "Student Added", details: "New student enrolled in CSE", time: "2 hours ago" },
    { action: "Attendance Updated", details: "Attendance marked for Semester 6", time: "5 hours ago" },
    { action: "Marks Updated", details: "Internal marks updated for DS", time: "1 day ago" },
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
          <h1 className="text-3xl font-bold font-serif text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of the system.</p>
        </div>

        {/* Quick Actions */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button 
                onClick={() => navigate("/admin/students")} 
                className="h-20 flex flex-col gap-2"
                variant="outline"
              >
                <UserPlus className="h-6 w-6" />
                <span>Manage Students</span>
              </Button>
              <Button 
                onClick={() => navigate("/admin/attendance")} 
                className="h-20 flex flex-col gap-2"
                variant="outline"
              >
                <BookOpen className="h-6 w-6" />
                <span>Update Attendance</span>
              </Button>
              <Button 
                onClick={() => navigate("/admin/marks")} 
                className="h-20 flex flex-col gap-2"
                variant="outline"
              >
                <Award className="h-6 w-6" />
                <span>Update Marks</span>
              </Button>
            </div>
          </CardContent>
        </Card>

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
