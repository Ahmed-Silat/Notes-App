import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Pencil } from "lucide-react";
import { exportNotePdf } from "@/lib/exportNotes";
import { formatDate, getErrorMessage } from "@/lib/helper";
import NoteContent from "@/components/NoteContent/NoteContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Downloads the note as a PDF; building it can take a moment the first time.
const DownloadPdfButton = ({ note }) => {
  const [isExporting, setIsExporting] = useState(false);

  const onDownload = async () => {
    setIsExporting(true);
    try {
      await exportNotePdf(note);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not export the note"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="sm:mr-auto"
      disabled={isExporting}
      onClick={onDownload}
    >
      {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
      {isExporting ? "Preparing PDF..." : "Download PDF"}
    </Button>
  );
};

// Read-only view of a note, rendered inside <NoteDialog>. Without `onEdit`
// (notes in Trash) there's no Edit button.
const ViewNote = ({ note, onEdit }) => (
  <>
    <DialogHeader className="pr-8">
      <DialogTitle className="text-xl leading-snug font-semibold wrap-break-word">
        {note.title}
      </DialogTitle>
      <DialogDescription asChild>
        <time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time>
      </DialogDescription>
    </DialogHeader>

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

    <DialogFooter>
      <DownloadPdfButton note={note} />
      <DialogClose asChild>
        <Button type="button" variant="outline">
          Close
        </Button>
      </DialogClose>
      {onEdit && (
        <Button type="button" onClick={onEdit}>
          <Pencil />
          Edit note
        </Button>
      )}
    </DialogFooter>
  </>
);

export default ViewNote;
