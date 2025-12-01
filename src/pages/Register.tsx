import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, UserPlus, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { useAuth, RegisterInput } from "@/contexts/AuthContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormState
  extends Omit<RegisterInput, "semester" | "password"> {
  password: string;
  confirmPassword: string;
  semester: string;
}

const initialForm: FormState = {
  name: "",
  regNumber: "",
  email: "",
  department: "",
  semester: "",
  role: "student",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formState, setFormState] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleRoleChange = (role: FormState["role"]) => {
    setFormState((prev) => ({ ...prev, role }));
  };

  const resetForm = () => {
    setFormState(initialForm);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const payload: RegisterInput = {
      name: formState.name.trim(),
      regNumber: formState.regNumber.trim(),
      email: formState.email.trim() || undefined,
      department:
        formState.role === "student" && formState.department.trim()
          ? formState.department.trim()
          : undefined,
      semester:
        formState.role === "student" && formState.semester
          ? Number(formState.semester)
          : undefined,
      role: formState.role,
      password: formState.password,
    };

    const result = register(payload);

    if (result.success) {
      toast.success("Registration successful. You can now log in.");
      resetForm();
      navigate("/login");
    } else {
      toast.error(result.message || "Unable to register. Please try again.");
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
                  Create an account
                </CardTitle>
                <CardDescription>
                  Register to access the student and admin dashboards
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
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input
                    id="regNumber"
                    placeholder="AP21110010001"
                    value={formState.regNumber}
                    onChange={handleChange("regNumber")}
                    required
                  />
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
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formState.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formState.role === "student" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="Computer Science"
                      value={formState.department}
                      onChange={handleChange("department")}
                    />
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
                    />
                  </div>
                </div>
              )}

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
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formState.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    required
                  />
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

