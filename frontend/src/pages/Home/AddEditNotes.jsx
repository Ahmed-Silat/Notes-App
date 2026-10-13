import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { createNotes, updateUserNotes } from "@/Service/NotesService";
import { getErrorMessage } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { noteSchema } from "@/schemas/note.schema";
import TagInput from "@/components/Input/TagInput";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

// Form rendered inside the note editor <Dialog> on the Home page.
const AddEditNotes = ({ onClose, noteData, type, getAllNotes }) => {
  const isEdit = type === "edit";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: noteData?.title || "",
      content: noteData?.content || "",
      tags: noteData?.tags || [],
    },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    try {
      const res = isEdit
        ? await updateUserNotes(
            noteData._id,
            values.title,
            values.content,
            values.tags
          )
        : await createNotes(values.title, values.content, values.tags);

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      getAllNotes();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const titleError = errors.title?.message;
  const contentError = errors.content?.message;

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEdit ? "Edit note" : "New note"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update your note and save the changes."
            : "Write down an idea, a to-do or anything worth remembering."}
        </DialogDescription>
      </DialogHeader>

      {/* disables every input and button while the request is in flight */}
      <fieldset disabled={isSubmitting} className="grid min-w-0 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            placeholder="Give your note a title"
            className="h-10 text-base"
            aria-invalid={Boolean(titleError)}
            {...register("title")}
          />
          {titleError && <p className="text-sm text-destructive">{titleError}</p>}
        </div>

        <div className="grid gap-2">
          <Label>Content</Label>
          {/* the editor isn't a native input, so the fieldset can't disable it */}
          <div
            className={cn(
              "note-editor",
              isSubmitting && "pointer-events-none opacity-50"
            )}
            aria-invalid={Boolean(contentError)}
            aria-disabled={isSubmitting}
          >
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  placeholder="Start writing..."
                  readOnly={isSubmitting}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => field.onBlur()}
                />
              )}
            />
          </div>
          {contentError && (
            <p className="text-sm text-destructive">{contentError}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="note-tags">Tags</Label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput id="note-tags" tags={field.value} setTags={field.onChange} />
            )}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add note"}
          </Button>
        </DialogFooter>
      </fieldset>
    </form>
  );
};

export default AddEditNotes;
