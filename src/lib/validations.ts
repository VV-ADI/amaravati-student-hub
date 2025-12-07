import { z } from "zod";

// Registration form validation schema
export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, hyphens, and apostrophes"),
  regNumber: z
    .string()
    .trim()
    .min(5, "Registration number must be at least 5 characters")
    .max(20, "Registration number must be less than 20 characters")
    .regex(/^[A-Z0-9]+$/i, "Registration number can only contain letters and numbers"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  department: z
    .string()
    .trim()
    .max(100, "Department must be less than 100 characters")
    .optional(),
  semester: z
    .number()
    .int("Semester must be a whole number")
    .min(1, "Semester must be between 1 and 10")
    .max(10, "Semester must be between 1 and 10")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Student form validation schema (for admin)
export const studentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, hyphens, and apostrophes"),
  reg_number: z
    .string()
    .trim()
    .min(5, "Registration number must be at least 5 characters")
    .max(20, "Registration number must be less than 20 characters")
    .regex(/^[A-Z0-9]+$/i, "Registration number can only contain letters and numbers"),
  department: z
    .string()
    .trim()
    .max(100, "Department must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  semester: z
    .string()
    .optional()
    .refine((val) => !val || (parseInt(val) >= 1 && parseInt(val) <= 10), {
      message: "Semester must be between 1 and 10",
    }),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Phone must be less than 20 characters")
    .regex(/^[0-9+\-\s()]*$/, "Phone can only contain numbers, spaces, and +-()")
    .optional()
    .or(z.literal("")),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

// Helper to format zod errors for display
export function formatZodErrors(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join(". ");
}
