import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const NotesGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {children}
  </div>
);

export const NotesSkeleton = ({ count = 6 }) => (
  <NotesGrid>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="space-y-3 rounded-xl border bg-card p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-6 h-3 w-24" />
      </div>
    ))}
  </NotesGrid>
);

// "Show more" under a list: appends the next page of notes.
export const ShowMoreNotes = ({ shown, total, isLoadingMore, onLoadMore }) => (
  <div className="mt-4 space-y-8">
    {isLoadingMore && <NotesSkeleton count={3} />}
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">
        Showing {shown} of {total} notes
      </p>
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? <Loader2 className="animate-spin" /> : <ChevronDown />}
        {isLoadingMore ? "Loading..." : "Show more"}
      </Button>
    </div>
  </div>
);
