// Default subjects for all students
export const DEFAULT_SUBJECTS = [
  "Discrete Mathematics",
  "Coding Skills",
  "C++ Programming",
] as const;

// Default attendance structure
export const getDefaultAttendance = () => {
  const attendance: Record<string, { present: number; total: number }> = {};
  DEFAULT_SUBJECTS.forEach((subject) => {
    attendance[subject] = { present: 0, total: 0 };
  });
  return attendance;
};

// Default marks structure
export const getDefaultMarks = () => {
  const marks: Record<string, { internal1: number; internal2: number; external: number }> = {};
  DEFAULT_SUBJECTS.forEach((subject) => {
    marks[subject] = { internal1: 0, internal2: 0, external: 0 };
  });
  return marks;
};
