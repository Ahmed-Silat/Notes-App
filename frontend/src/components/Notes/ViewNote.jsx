import { Pencil } from "lucide-react";
import { formatDate } from "@/lib/helper";
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

// Read-only view of a note, rendered inside <NoteDialog>.
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
      <DialogClose asChild>
        <Button type="button" variant="outline">
          Close
        </Button>
      </DialogClose>
      <Button type="button" onClick={onEdit}>
        <Pencil />
        Edit note
      </Button>
    </DialogFooter>
  </>
);

export default ViewNote;
