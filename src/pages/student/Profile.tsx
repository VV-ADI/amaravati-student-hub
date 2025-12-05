import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, BookOpen, Calendar, User, Hash } from "lucide-react";
import { useStudentRecord } from "@/hooks/useStudentRecord";

export default function Profile() {
  const { user } = useAuth();
  const { record, loading } = useStudentRecord();

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | undefined }) => (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-accent-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || "-"}</p>
      </div>
    </div>
  );

  const calculateOverallAttendance = () => {
    if (!record || !record.attendance) return 0;
    const subjects = Object.keys(record.attendance);
    if (subjects.length === 0) return 0;
    
    let total = 0;
    subjects.forEach(subject => {
      const att = record.attendance[subject];
      if (att.total > 0) {
        total += (att.present / att.total) * 100;
      }
    });
    return Math.round(total / subjects.length);
  };

  const calculateSGPA = () => {
    if (!record || !record.marks) return "0.00";
    const subjects = Object.keys(record.marks);
    if (subjects.length === 0) return "0.00";

    let totalGradePoints = 0;
    subjects.forEach(subject => {
      const marks = record.marks[subject];
      const total = marks.internal1 + marks.internal2 + marks.external;
      totalGradePoints += (total / 125) * 10;
    });
    return (totalGradePoints / subjects.length).toFixed(2);
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
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold font-serif">{user?.name}</h2>
                <p className="text-muted-foreground">{record?.reg_number || user?.regNumber}</p>
                <p className="text-sm text-accent mt-1">{record?.department || user?.department}</p>
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
              <InfoItem icon={Hash} label="Registration Number" value={record?.reg_number || user?.regNumber} />
              <InfoItem icon={Mail} label="Email" value={record?.email || user?.email} />
              <InfoItem icon={Phone} label="Phone" value={record?.phone || undefined} />
              <InfoItem icon={BookOpen} label="Department" value={record?.department || user?.department} />
              <InfoItem icon={Calendar} label="Semester" value={record?.semester ? `Semester ${record.semester}` : user?.semester ? `Semester ${user.semester}` : undefined} />
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
                  {record?.marks ? Object.keys(record.marks).length : 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Subjects</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold font-serif text-accent-green">
                  {calculateOverallAttendance()}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Overall Attendance</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold font-serif text-accent">
                  {calculateSGPA()}
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
