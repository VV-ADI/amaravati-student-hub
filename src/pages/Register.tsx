import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, UserPlus, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { useAuth, RegisterData } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registrationSchema, formatZodErrors } from "@/lib/validations";

interface FormState {
  name: string;
  regNumber: string;
  email: string;
  department: string;
  semester: string;
  password: string;
  confirmPassword: string;
  adminCode: string;
}

const initialForm: FormState = {
  name: "",
  regNumber: "",
  email: "",
  department: "",
  semester: "",
  password: "",
  confirmPassword: "",
  adminCode: "",
};

// Simple admin code for registration (for demo purposes)
const ADMIN_SECRET_CODE = "admin123";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [formState, setFormState] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange =
    (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
      // Clear error for this field when user types
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    // Validate with zod
    const validationData = {
      name: formState.name,
      regNumber: formState.regNumber,
      email: formState.email,
      department: formState.department || undefined,
      semester: formState.semester ? Number(formState.semester) : undefined,
      password: formState.password,
      confirmPassword: formState.confirmPassword,
    };

    const result = registrationSchema.safeParse(validationData);
    
    if (!result.success) {
      // Map errors to fields
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

    // Check if admin code is provided and correct
    const isAdmin = formState.adminCode.trim() === ADMIN_SECRET_CODE;

    const payload: RegisterData = {
      name: formState.name.trim(),
      regNumber: formState.regNumber.trim().toUpperCase(),
      email: formState.email.trim(),
      department: formState.department.trim() || undefined,
      semester: formState.semester ? Number(formState.semester) : undefined,
      role: isAdmin ? "admin" : "student",
      password: formState.password,
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

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-serif">
                  Student Registration
                </CardTitle>
                <CardDescription>
                  Create your student account to access the portal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Rajesh Kumar"
                      value={formState.name}
                      onChange={handleChange("name")}
                      className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input
                    id="regNumber"
                    placeholder="AP21110010001"
                    value={formState.regNumber}
                    onChange={handleChange("regNumber")}
                    className={errors.regNumber ? "border-destructive" : ""}
                    required
                  />
                  {errors.regNumber && <p className="text-sm text-destructive">{errors.regNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@srmap.edu.in"
                      value={formState.email}
                      onChange={handleChange("email")}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Computer Science"
                    value={formState.department}
                    onChange={handleChange("department")}
                    className={errors.department ? "border-destructive" : ""}
                  />
                  {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="6"
                  value={formState.semester}
                  onChange={handleChange("semester")}
                  className={errors.semester ? "border-destructive" : ""}
                />
                {errors.semester && <p className="text-sm text-destructive">{errors.semester}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Code (optional)</Label>
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Leave empty for student registration"
                  value={formState.adminCode}
                  onChange={handleChange("adminCode")}
                />
                <p className="text-xs text-muted-foreground">Enter admin code to register as admin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formState.password}
                      onChange={handleChange("password")}
                      className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formState.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                    required
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Register"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline-offset-2 hover:underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
