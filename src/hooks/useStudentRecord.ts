import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceData {
  [subject: string]: {
    present: number;
    total: number;
  };
}

interface MarksData {
  [subject: string]: {
    internal1: number;
    internal2: number;
    external: number;
  };
}

interface StudentRecord {
  id: string;
  user_id: string;
  reg_number: string;
  name: string;
  department: string | null;
  semester: number | null;
  email: string | null;
  phone: string | null;
  attendance: AttendanceData;
  marks: MarksData;
}

export function useStudentRecord() {
  const { user } = useAuth();
  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("student_records")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setRecord({
            ...data,
            attendance: (data.attendance as AttendanceData) || {},
            marks: (data.marks as MarksData) || {},
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [user]);

  return { record, loading, error };
}
