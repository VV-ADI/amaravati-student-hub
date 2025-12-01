import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  regNumber: string;
  role: "admin" | "student";
  email?: string;
  department?: string;
  semester?: number;
}

interface AuthContextType {
  user: User | null;
  login: (regNumber: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Initialize demo data if not exists
    const users = localStorage.getItem("users");
    if (!users) {
      const demoUsers = [
        {
          id: "admin1",
          name: "Admin User",
          regNumber: "ADMIN001",
          password: "admin123",
          role: "admin",
          email: "admin@srmap.edu.in",
        },
        {
          id: "student1",
          name: "Rajesh Kumar",
          regNumber: "AP21110010001",
          password: "student123",
          role: "student",
          email: "rajesh@srmap.edu.in",
          department: "Computer Science",
          semester: 6,
        },
        {
          id: "student2",
          name: "Priya Sharma",
          regNumber: "AP21110010002",
          password: "student123",
          role: "student",
          email: "priya@srmap.edu.in",
          department: "Electronics",
          semester: 6,
        },
      ];
      localStorage.setItem("users", JSON.stringify(demoUsers));
      
      // Initialize student records
      const studentRecords = [
        {
          id: "student1",
          regNumber: "AP21110010001",
          name: "Rajesh Kumar",
          department: "Computer Science",
          semester: 6,
          email: "rajesh@srmap.edu.in",
          phone: "+91 9876543210",
          attendance: {
            "Data Structures": { present: 28, total: 30 },
            "Operating Systems": { present: 25, total: 30 },
            "Database Management": { present: 29, total: 30 },
            "Web Development": { present: 27, total: 30 },
            "Software Engineering": { present: 26, total: 30 },
          },
          marks: {
            "Data Structures": { internal1: 23, internal2: 25, external: 85 },
            "Operating Systems": { internal1: 20, internal2: 22, external: 78 },
            "Database Management": { internal1: 24, internal2: 25, external: 88 },
            "Web Development": { internal1: 22, internal2: 24, external: 82 },
            "Software Engineering": { internal1: 21, internal2: 23, external: 80 },
          },
        },
        {
          id: "student2",
          regNumber: "AP21110010002",
          name: "Priya Sharma",
          department: "Electronics",
          semester: 6,
          email: "priya@srmap.edu.in",
          phone: "+91 9876543211",
          attendance: {
            "Digital Electronics": { present: 27, total: 30 },
            "Microprocessors": { present: 28, total: 30 },
            "Signal Processing": { present: 26, total: 30 },
            "Communication Systems": { present: 29, total: 30 },
            "Control Systems": { present: 27, total: 30 },
          },
          marks: {
            "Digital Electronics": { internal1: 24, internal2: 25, external: 86 },
            "Microprocessors": { internal1: 23, internal2: 24, external: 84 },
            "Signal Processing": { internal1: 22, internal2: 23, external: 80 },
            "Communication Systems": { internal1: 25, internal2: 25, external: 90 },
            "Control Systems": { internal1: 23, internal2: 24, external: 82 },
          },
        },
      ];
      localStorage.setItem("studentRecords", JSON.stringify(studentRecords));
    }
  }, []);

  const login = (regNumber: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find(
      (u: any) => u.regNumber === regNumber && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
