import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

type UserRole = "admin" | "student";

export interface User {
  id: string;
  name: string;
  regNumber: string;
  role: UserRole;
  email?: string;
  department?: string;
  semester?: number;
}

interface StoredUser extends User {
  password: string;
}

export interface RegisterInput extends Omit<User, "id"> {
  password: string;
}

const normalizeRegNumber = (value: string) => value.trim().toUpperCase();

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (regNumber: string, password: string) => boolean;
  register: (payload: RegisterInput) => AuthResponse;
  logout: () => void;
  isAuthenticated: boolean;
}

const getRandomId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

class UserStore {
  private storageKey = "users";
  private users: StoredUser[] = [];

  constructor() {
    this.users = this.loadUsers();
    if (this.users.length === 0) {
      this.users = this.initializeDemoUsers();
      this.saveUsers();
    }
  }

  private loadUsers(): StoredUser[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveUsers() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }

  private initializeDemoUsers(): StoredUser[] {
    return [
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
  }

  getUsers() {
    return this.users.map(({ password, ...user }) => user);
  }

  findByCredentials(regNumber: string, password: string): User | null {
    const normalizedReg = normalizeRegNumber(regNumber);
    const sanitizedPassword = password.trim();

    const found = this.users.find(
      (user) =>
        normalizeRegNumber(user.regNumber) === normalizedReg &&
        user.password === sanitizedPassword
    );
    if (!found) return null;
    const { password: _pwd, ...sanitized } = found;
    return sanitized;
  }

  addUser(payload: RegisterInput): AuthResponse {
    const normalizedReg = normalizeRegNumber(payload.regNumber);
    const exists = this.users.some(
      (user) =>
        normalizeRegNumber(user.regNumber) === normalizedReg
    );

    if (exists) {
      return { success: false, message: "Registration number already exists" };
    }

    const newUser: StoredUser = {
      ...payload,
      regNumber: normalizedReg,
      id: getRandomId(),
      password: payload.password.trim(),
      semester: payload.semester ? Number(payload.semester) : undefined,
    };

    this.users.push(newUser);
    this.saveUsers();

    return { success: true };
  }
}

const ensureStudentRecords = () => {
  const existingRecords = localStorage.getItem("studentRecords");
  if (existingRecords) {
    return;
  }

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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const storeRef = useRef<UserStore | null>(null);

  const getStore = () => {
    if (!storeRef.current) {
      storeRef.current = new UserStore();
    }
    return storeRef.current;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    getStore();
    ensureStudentRecords();
  }, []);

  const login = (regNumber: string, password: string): boolean => {
    const foundUser = getStore().findByCredentials(regNumber, password);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = (payload: RegisterInput): AuthResponse => {
    return getStore().addUser(payload);
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
        register,
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
