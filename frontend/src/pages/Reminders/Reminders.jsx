import { Bell } from "lucide-react";
import EmptyState from "@/components/EmptyState/EmptyState";

const Reminders = () => {
  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Reminders</h1>
      <EmptyState
        icon={Bell}
        title="No reminders"
        description="All your reminders will appear here."
      />
    </>
  );
};

export default Reminders;
