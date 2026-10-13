import { Archive as ArchiveIcon } from "lucide-react";
import EmptyState from "@/components/EmptyState/EmptyState";

const Archive = () => {
  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Archive</h1>
      <EmptyState
        icon={ArchiveIcon}
        title="No archived notes"
        description="All your archived notes will appear here."
      />
    </>
  );
};

export default Archive;
