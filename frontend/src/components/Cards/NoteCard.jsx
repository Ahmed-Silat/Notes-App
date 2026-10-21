import {
  Archive,
  ArchiveRestore,
  BellPlus,
  Link2,
  Loader2,
  Pencil,
  Pin,
  Share2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, htmlToText } from "@/lib/helper";
import { getNoteColor } from "@/lib/noteColors";
import { cn } from "@/lib/utils";
import NoteContent from "@/components/NoteContent/NoteContent";
import { NoteColorMenu } from "@/components/Notes/NoteColorPicker";

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
  // optional: a word before the date, e.g. "Edited"
  datePrefix,
  content,
  tags,
  isPinned,
  isArchived,
  // the note has an active public link
  isShared,
  color,
  busyLabel,
  // optional: archived notes can't be pinned, so their cards have no pin button
  onPinNote,
  // optional: makes each tag a button that filters the list by it
  onTagClick,
  onColorChange,
  onShare,
  onArchive,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const hasContent = Boolean(htmlToText(content));
  const isBusy = Boolean(busyLabel);

  return (
    <Card
      // while busy the card can't be clicked or focused
      inert={isBusy}
      aria-busy={isBusy}
      className={cn(
        "group relative gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-ring/50",
        getNoteColor(color).surface,
        isPinned && "ring-brand/50 dark:ring-brand/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Stretched button: makes the whole card open the note in view mode */}
        <button
          type="button"
          onClick={onOpen}
          className="text-left outline-none after:absolute after:inset-0 after:rounded-xl"
        >
          <h3 className="line-clamp-2 text-base font-semibold wrap-break-word">
            {title}
          </h3>
        </button>

        {onPinNote && (
          <ActionButton
            label={isPinned ? "Unpin note" : "Pin note"}
            onClick={onPinNote}
            className={cn(
              "-mt-1 -mr-1 shrink-0",
              isPinned
                ? "text-brand hover:text-brand"
                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
            )}
          >
            <Pin className={cn(isPinned && "fill-current")} />
          </ActionButton>
        )}
      </div>

      {hasContent && (
        <NoteContent
          html={content}
          compact
          className="line-clamp-6 text-sm text-muted-foreground"
        />
      )}

      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) =>
            onTagClick ? (
              <Badge
                key={tag}
                asChild
                variant="secondary"
                className="relative z-10 font-normal outline-none hover:bg-secondary/80 hover:text-foreground"
              >
                <button
                  type="button"
                  aria-label={`Show notes tagged ${tag}`}
                  onClick={() => onTagClick(tag)}
                >
                  #{tag}
                </button>
              </Badge>
            ) : (
              <Badge key={tag} variant="secondary" className="font-normal">
                #{tag}
              </Badge>
            ),
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <time dateTime={date}>
            {datePrefix && `${datePrefix} `}
            {formatDate(date)}
          </time>
          {isShared && (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* above the stretched button, so hovering shows the tooltip */}
                <span role="img" aria-label="Shared by link" className="relative z-10">
                  <Link2 className="size-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Shared by link</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* stays visible while the color menu is open */}
        <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-has-[button:focus-visible]:opacity-100 sm:group-has-aria-expanded:opacity-100">
          <ActionButton label="Set reminder">
            <BellPlus />
          </ActionButton>
          {onColorChange && (
            <NoteColorMenu value={color ?? "default"} onChange={onColorChange} />
          )}
          {onShare && (
            <ActionButton label="Share note" onClick={onShare}>
              <Share2 />
            </ActionButton>
          )}
          <ActionButton
            label={isArchived ? "Unarchive note" : "Archive note"}
            onClick={onArchive}
          >
            {isArchived ? <ArchiveRestore /> : <Archive />}
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

      {isBusy && (
        <div
          role="status"
          className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-card/75 text-sm font-medium backdrop-blur-[1px]"
        >
          <Loader2 className="size-4 animate-spin text-brand" />
          {busyLabel}
        </div>
      )}
    </Card>
  );
};

export default NoteCard;
