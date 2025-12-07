import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, UserPlus, User, Mail, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

import { useAuth, RegisterData } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registrationSchema, formatZodErrors } from "@/lib/validations";

interface StudentFormState {
  name: string;
  regNumber: string;
  email: string;
  department: string;
  semester: string;
  password: string;
  confirmPassword: string;
}

interface AdminFormState {
  name: string;
  regNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  adminCode: string;
}

const initialStudentForm: StudentFormState = {
  name: "",
  regNumber: "",
  email: "",
  department: "",
  semester: "",
  password: "",
  confirmPassword: "",
};

const initialAdminForm: AdminFormState = {
  name: "",
  regNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  adminCode: "",
};

const ADMIN_SECRET_CODE = "admin123";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();
  const [studentForm, setStudentForm] = useState<StudentFormState>(initialStudentForm);
  const [adminForm, setAdminForm] = useState<AdminFormState>(initialAdminForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/student", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleStudentChange =
    (field: keyof StudentFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setStudentForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleAdminChange =
    (field: keyof AdminFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setAdminForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleStudentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validationData = {
      name: studentForm.name,
      regNumber: studentForm.regNumber,
      email: studentForm.email,
      department: studentForm.department || undefined,
      semester: studentForm.semester ? Number(studentForm.semester) : undefined,
      password: studentForm.password,
      confirmPassword: studentForm.confirmPassword,
    };

    const result = registrationSchema.safeParse(validationData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(formatZodErrors(result.error));
      return;
    }

    setIsSubmitting(true);

    const payload: RegisterData = {
      name: studentForm.name.trim(),
      regNumber: studentForm.regNumber.trim().toUpperCase(),
      email: studentForm.email.trim(),
      department: studentForm.department.trim() || undefined,
      semester: studentForm.semester ? Number(studentForm.semester) : undefined,
      role: "student",
      password: studentForm.password,
    };

    const { error } = await register(payload);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Registration successful! Please check your email to confirm your account.");
      navigate("/login");
    }

    setIsSubmitting(false);
  };

  const handleAdminSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    if (adminForm.adminCode !== ADMIN_SECRET_CODE) {
      toast.error("Invalid admin code");
      setErrors({ adminCode: "Invalid admin code" });
      return;
    }

    const validationData = {
      name: adminForm.name,
      regNumber: adminForm.regNumber,
      email: adminForm.email,
      password: adminForm.password,
      confirmPassword: adminForm.confirmPassword,
    };

    const result = registrationSchema.safeParse(validationData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(formatZodErrors(result.error));
      return;
    }

    setIsSubmitting(true);

    const payload: RegisterData = {
      name: adminForm.name.trim(),
      regNumber: adminForm.regNumber.trim().toUpperCase(),
      email: adminForm.email.trim(),
      role: "admin",
      password: adminForm.password,
    };

    const { error } = await register(payload);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Admin registration successful! Please check your email to confirm your account.");
      navigate("/login");
    }

    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent-brown flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-foreground"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent-brown flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-full mb-4">
            <GraduationCap className="w-12 h-12 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground font-serif mb-2">
            SRM University AP
          </h1>
          <p className="text-primary-foreground/80">Student Management System</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-serif">Create Account</CardTitle>
            <CardDescription>
              Register to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "student" | "admin")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form className="space-y-4" onSubmit={handleStudentSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="student-name"
                          placeholder="Rajesh Kumar"
                          value={studentForm.name}
                          onChange={handleStudentChange("name")}
                          className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                          required
                        />
                      </div>
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-regNumber">Registration Number</Label>
                      <Input
                        id="student-regNumber"
                        placeholder="AP21110010001"
                        value={studentForm.regNumber}
                        onChange={handleStudentChange("regNumber")}
                        className={errors.regNumber ? "border-destructive" : ""}
                        required
                      />
                      {errors.regNumber && <p className="text-sm text-destructive">{errors.regNumber}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="name@srmap.edu.in"
                          value={studentForm.email}
                          onChange={handleStudentChange("email")}
                          className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                          required
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-department">Department</Label>
                      <Input
                        id="student-department"
                        placeholder="Computer Science"
                        value={studentForm.department}
                        onChange={handleStudentChange("department")}
                        className={errors.department ? "border-destructive" : ""}
                      />
                      {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-semester">Semester</Label>
                    <Input
                      id="student-semester"
                      type="number"
                      min={1}
                      max={10}
                      placeholder="6"
                      value={studentForm.semester}
                      onChange={handleStudentChange("semester")}
                      className={errors.semester ? "border-destructive" : ""}
                    />
                    {errors.semester && <p className="text-sm text-destructive">{errors.semester}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="student-password"
                          type="password"
                          placeholder="••••••••"
                          value={studentForm.password}
                          onChange={handleStudentChange("password")}
                          className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                          required
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-confirmPassword">Confirm Password</Label>
                      <Input
                        id="student-confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={studentForm.confirmPassword}
                        onChange={handleStudentChange("confirmPassword")}
                        className={errors.confirmPassword ? "border-destructive" : ""}
                        required
                      />
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Register as Student"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form className="space-y-4" onSubmit={handleAdminSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-name"
                          placeholder="Admin Name"
                          value={adminForm.name}
                          onChange={handleAdminChange("name")}
                          className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                          required
                        />
                      </div>
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-regNumber">Admin ID</Label>
                      <Input
                        id="admin-regNumber"
                        placeholder="ADMIN001"
                        value={adminForm.regNumber}
                        onChange={handleAdminChange("regNumber")}
                        className={errors.regNumber ? "border-destructive" : ""}
                        required
                      />
                      {errors.regNumber && <p className="text-sm text-destructive">{errors.regNumber}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@srmap.edu.in"
                        value={adminForm.email}
                        onChange={handleAdminChange("email")}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-code">Admin Secret Code</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-code"
                        type="password"
                        placeholder="Enter admin code"
                        value={adminForm.adminCode}
                        onChange={handleAdminChange("adminCode")}
                        className={`pl-10 ${errors.adminCode ? "border-destructive" : ""}`}
                        required
                      />
                    </div>
                    {errors.adminCode && <p className="text-sm text-destructive">{errors.adminCode}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="••••••••"
                          value={adminForm.password}
                          onChange={handleAdminChange("password")}
                          className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                          required
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-confirmPassword">Confirm Password</Label>
                      <Input
                        id="admin-confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={adminForm.confirmPassword}
                        onChange={handleAdminChange("confirmPassword")}
                        className={errors.confirmPassword ? "border-destructive" : ""}
                        required
                      />
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Register as Admin"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium underline-offset-2 hover:underline">
                  Back to login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;