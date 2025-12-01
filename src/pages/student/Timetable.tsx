import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Timetable() {
  const schedule = {
    Monday: [
      { time: "9:00 - 10:00", subject: "Data Structures", room: "301", type: "Lecture" },
      { time: "10:15 - 11:15", subject: "Operating Systems", room: "205", type: "Lecture" },
      { time: "11:30 - 12:30", subject: "Web Development", room: "Lab 4", type: "Lab" },
      { time: "2:00 - 3:00", subject: "Database Management", room: "302", type: "Lecture" },
    ],
    Tuesday: [
      { time: "9:00 - 10:00", subject: "Software Engineering", room: "201", type: "Lecture" },
      { time: "10:15 - 11:15", subject: "Data Structures", room: "Lab 2", type: "Lab" },
      { time: "11:30 - 12:30", subject: "Operating Systems", room: "203", type: "Lecture" },
      { time: "2:00 - 3:00", subject: "Database Management", room: "Lab 3", type: "Lab" },
    ],
    Wednesday: [
      { time: "9:00 - 10:00", subject: "Web Development", room: "301", type: "Lecture" },
      { time: "10:15 - 11:15", subject: "Software Engineering", room: "Lab 1", type: "Lab" },
      { time: "11:30 - 12:30", subject: "Data Structures", room: "205", type: "Tutorial" },
      { time: "2:00 - 3:00", subject: "Operating Systems", room: "Lab 5", type: "Lab" },
    ],
    Thursday: [
      { time: "9:00 - 10:00", subject: "Database Management", room: "302", type: "Lecture" },
      { time: "10:15 - 11:15", subject: "Web Development", room: "203", type: "Tutorial" },
      { time: "11:30 - 12:30", subject: "Software Engineering", room: "201", type: "Lecture" },
      { time: "2:00 - 3:00", subject: "Data Structures", room: "301", type: "Lecture" },
    ],
    Friday: [
      { time: "9:00 - 10:00", subject: "Operating Systems", room: "205", type: "Tutorial" },
      { time: "10:15 - 11:15", subject: "Database Management", room: "302", type: "Tutorial" },
      { time: "11:30 - 12:30", subject: "Web Development", room: "Lab 4", type: "Lab" },
      { time: "2:00 - 3:00", subject: "Software Engineering", room: "Lab 2", type: "Lab" },
    ],
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture":
        return "bg-accent text-accent-foreground";
      case "Lab":
        return "bg-accent-green text-foreground";
      case "Tutorial":
        return "bg-accent-brown text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif">My Timetable</h1>
          <p className="text-muted-foreground mt-1">Weekly class schedule</p>
        </div>

        <div className="space-y-4">
          {Object.entries(schedule).map(([day, classes]) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="font-serif text-xl">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {classes.map((classItem, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {classItem.time}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getTypeColor(
                            classItem.type
                          )}`}
                        >
                          {classItem.type}
                        </span>
                      </div>
                      <p className="font-semibold mb-1">{classItem.subject}</p>
                      <p className="text-sm text-muted-foreground">{classItem.room}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
