import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Link2, Link2Off, Loader2 } from "lucide-react";
import { shareNote, stopSharingNote } from "@/Service/NotesService";
import { getErrorMessage } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const COPIED_MS = 2000;

const getShareUrl = (shareId) => `${window.location.origin}/s/${shareId}`;

// Creates, copies and turns off a note's public read-only link.
// `onShareChange(note)` gets the note back with its new or removed shareId.
const ShareNoteDialog = ({ note, open, onOpenChange, onShareChange }) => {
  // "create" or "stop" while that request is in flight
  const [pending, setPending] = useState(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = note?.shareId ? getShareUrl(note.shareId) : "";

  const run = async (action, request) => {
    setPending(action);
    try {
      const res = await request(note._id);
      if (!res.data.success) {
        toast.error(res.data.message);
        return false;
      }
      onShareChange(res.data.note);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setPending(null);
    }
  };

  const onCreate = () => run("create", shareNote);

  const onStop = async () => {
    if (await run("stop", stopSharingNote)) {
      toast.success("Link turned off");
      setCopied(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      toast.error("Couldn't copy the link. Select it and copy it yourself.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
          <DialogDescription>
            {shareUrl
              ? `Anyone with this link can read “${note.title}”, without logging in. They can't edit it or see your other notes.`
              : `Create a link anyone can use to read “${note?.title}”, without logging in. They can't edit it or see your other notes.`}
          </DialogDescription>
        </DialogHeader>

        {shareUrl && (
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              aria-label="Share link"
              onFocus={(e) => e.target.select()}
              className="h-10"
            />
            <Button
              type="button"
              size="lg"
              className="h-10"
              onClick={onCopy}
              disabled={Boolean(pending)}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}

        <DialogFooter>
          {shareUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
                onClick={onStop}
                disabled={Boolean(pending)}
              >
                {pending === "stop" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Link2Off />
                )}
                Stop sharing
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Done
                </Button>
              </DialogClose>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={onCreate}
                disabled={Boolean(pending)}
              >
                {pending === "create" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Link2 />
                )}
                {pending === "create" ? "Creating link..." : "Create link"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareNoteDialog;
