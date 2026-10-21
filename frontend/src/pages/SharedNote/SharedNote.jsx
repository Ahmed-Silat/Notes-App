import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Link2Off, RotateCw, TriangleAlert } from "lucide-react";
import { getSharedNote } from "@/Service/NotesService";
import { formatDate } from "@/lib/helper";
import { getNoteColor } from "@/lib/noteColors";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/EmptyState/EmptyState";
import Logo from "@/components/Logo";
import NoteContent from "@/components/NoteContent/NoteContent";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Keeps search engines from listing shared notes, while this page is open.
const useNoIndex = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.append(meta);
    return () => meta.remove();
  }, []);
};

const NoteSkeleton = () => (
  <div className="space-y-4 rounded-xl border bg-card p-6 sm:p-8">
    <Skeleton className="h-7 w-2/3" />
    <Skeleton className="h-4 w-24" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

// Public, read-only view of a shared note (/s/:shareId). Works without
// logging in, so it sits outside AppLayout.
const SharedNote = () => {
  const { shareId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  // "loading", "ready", "not-found" (link turned off, or the note deleted) or "error"
  const [status, setStatus] = useState("loading");
  const [note, setNote] = useState(null);

  useNoIndex();

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await getSharedNote(shareId);
      setNote(res.data.note);
      setStatus("ready");
      document.title = `${res.data.note.title} | Notes App`;
    } catch (error) {
      // 400 is a malformed link, which can't work either
      const code = error.response?.status;
      setStatus(code === 404 || code === 400 ? "not-found" : "error");
    }
  }, [shareId]);

  useEffect(() => {
    load();
  }, [load]);

  const renderNote = () => {
    if (status === "loading") return <NoteSkeleton />;

    if (status === "not-found") {
      return (
        <EmptyState
          icon={Link2Off}
          title="This link doesn't work"
          description="The note may have been deleted, or its owner stopped sharing it."
        />
      );
    }

    if (status === "error") {
      return (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load this note"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              <RotateCw />
              Try again
            </Button>
          }
        />
      );
    }

    return (
      <article
        className={cn(
          "space-y-5 rounded-xl border bg-card p-6 shadow-sm sm:p-8",
          getNoteColor(note.color).surface,
        )}
      >
        <header className="space-y-1.5">
          <h1 className="text-2xl leading-snug font-semibold tracking-tight wrap-break-word">
            {note.title}
          </h1>
          <time
            dateTime={note.createdAt}
            className="text-sm text-muted-foreground"
          >
            {formatDate(note.createdAt)}
          </time>
        </header>

        <NoteContent html={note.content} className="text-base" />

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="flex min-h-svh flex-col p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label="Good Notes home">
          <Logo />
        </Link>
        <ThemeToggle />
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 py-10 sm:py-16">
        {status === "ready" && (
          <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Shared note · read only
          </p>
        )}
        {renderNote()}

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          {currentUser ? (
            <Button asChild variant="outline">
              <Link to="/">Back to my notes</Link>
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Write, tag and pin your own notes with Good Notes.
              </p>
              <Button asChild>
                <Link to="/signup">
                  Create your own notes
                  <ArrowRight />
                </Link>
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SharedNote;
