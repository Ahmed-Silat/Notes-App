import { z } from "zod";
import { htmlToText } from "@/lib/helper";
import { NOTE_COLOR_NAMES } from "@/lib/noteColors";

// Mirrors createNoteDto in backend/src/dtos/note.dto.js.
export const noteSchema = z.object({
  title: z.string().trim().min(1, "Please enter the title"),
  // the editor produces HTML, so "<p><br></p>" still counts as empty
  content: z
    .string()
    .refine((value) => htmlToText(value).length > 0, "Please enter the content"),
  tags: z.array(z.string().trim().min(1)),
  color: z.enum(NOTE_COLOR_NAMES),
});
