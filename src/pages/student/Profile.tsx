import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Mail, Phone, BookOpen, Calendar, User, Hash } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const studentRecords = JSON.parse(localStorage.getItem("studentRecords") || "[]");
    const data = studentRecords.find((s: any) => s.id === user?.id);
    setStudentData(data);
  }, [user]);

  const InfoItem = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-accent-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif">My Profile</h1>
          <p className="text-muted-foreground mt-1">View your personal information</p>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-4xl font-bold text-accent-foreground">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold font-serif">{user?.name}</h2>
                <p className="text-muted-foreground">{studentData?.regNumber}</p>
                <p className="text-sm text-accent mt-1">{studentData?.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={User} label="Full Name" value={user?.name} />
              <InfoItem icon={Hash} label="Registration Number" value={studentData?.regNumber} />
              <InfoItem icon={Mail} label="Email" value={studentData?.email} />
              <InfoItem icon={Phone} label="Phone" value={studentData?.phone} />
              <InfoItem icon={BookOpen} label="Department" value={studentData?.department} />
              <InfoItem icon={Calendar} label="Semester" value={`Semester ${studentData?.semester}`} />
            </div>
          </CardContent>
        </Card>

        {/* Academic Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Academic Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold font-serif text-accent">
                  {studentData?.attendance
                    ? Object.keys(studentData.attendance).length
                    : 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Subjects</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold font-serif text-accent-green">
                  {studentData?.attendance
                    ? Math.round(
                        (Object.values(studentData.attendance).reduce(
                          (acc: number, curr: any) =>
                            acc + (curr.present / curr.total) * 100,
                          0
                        ) as number) / Object.keys(studentData.attendance).length
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground mt-1">Overall Attendance</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold font-serif text-accent">
                  {studentData?.marks
                    ? (
                        (Object.values(studentData.marks).reduce(
                          (acc: number, mark: any) => {
                            const total = mark.internal1 + mark.internal2 + mark.external;
                            return acc + (total / 125) * 10;
                          },
                          0
                        ) as number) / Object.keys(studentData.marks).length
                      ).toFixed(2)
                    : "0.00"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Current SGPA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
