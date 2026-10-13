import { Archive, BellPlus, Pencil, Pin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, htmlToText } from "@/lib/helper";
import { cn } from "@/lib/utils";

const ActionButton = ({ label, onClick, className, children }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        onClick={onClick}
        className={cn("relative z-10 text-muted-foreground", className)}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onPinNote,
  onEdit,
  onDelete,
}) => {
  const preview = htmlToText(content);

  return (
    <Card
      className={cn(
        "group relative gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-ring/50",
        isPinned && "ring-brand/50 dark:ring-brand/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Stretched button: makes the whole card open the editor */}
        <button
          type="button"
          onClick={onEdit}
          className="text-left outline-none after:absolute after:inset-0 after:rounded-xl"
        >
          <h3 className="line-clamp-2 text-base font-semibold wrap-break-word">
            {title}
          </h3>
        </button>

        <ActionButton
          label={isPinned ? "Unpin note" : "Pin note"}
          onClick={onPinNote}
          className={cn(
            "-mt-1 -mr-1 shrink-0",
            isPinned
              ? "text-brand hover:text-brand"
              : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          )}
        >
          <Pin className={cn(isPinned && "fill-current")} />
        </ActionButton>
      </div>

      {preview && (
        <p className="line-clamp-5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {preview}
        </p>
      )}

      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <time dateTime={date} className="text-xs text-muted-foreground">
          {formatDate(date)}
        </time>

        <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-has-[button:focus-visible]:opacity-100">
          <ActionButton label="Set reminder">
            <BellPlus />
          </ActionButton>
          <ActionButton label="Archive note">
            <Archive />
          </ActionButton>
          <ActionButton label="Edit note" onClick={onEdit}>
            <Pencil />
          </ActionButton>
          <ActionButton
            label="Delete note"
            onClick={onDelete}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 />
          </ActionButton>
        </div>
      </div>
    </Card>
  );
};

export default NoteCard;
