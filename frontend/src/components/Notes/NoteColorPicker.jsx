import { Check, Palette } from "lucide-react";
import { NOTE_COLORS } from "@/lib/noteColors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// A color circle; the default one shows the plain card color.
const Swatch = ({ color, isSelected }) => (
  <span
    className={cn(
      "flex size-6 items-center justify-center rounded-full bg-card text-foreground ring-1 ring-foreground/20",
      color.surface,
      isSelected && "ring-2 ring-foreground"
    )}
  >
    {isSelected && <Check className="size-3.5" />}
  </span>
);

// Palette button on a note card; opens a row of colors to pick from.
export const NoteColorMenu = ({ value, onChange, className }) => (
  <DropdownMenu>
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Change color"
            className={cn("relative z-10 text-muted-foreground", className)}
          >
            <Palette />
          </Button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent>Change color</TooltipContent>
    </Tooltip>

    <DropdownMenuContent align="end" className="flex w-auto min-w-0 gap-0.5 p-1.5">
      {NOTE_COLORS.map((color) => (
        <DropdownMenuItem
          key={color.name}
          aria-label={color.label}
          title={color.label}
          className="rounded-full p-1"
          onSelect={() => onChange(color.name)}
        >
          <Swatch color={color} isSelected={color.name === value} />
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

// The same colors as a row of buttons, for the add / edit form.
export const NoteColorSwatches = ({ value, onChange, disabled }) => (
  <div className="flex flex-wrap gap-1">
    {NOTE_COLORS.map((color) => (
      <button
        key={color.name}
        type="button"
        aria-label={color.label}
        aria-pressed={color.name === value}
        title={color.label}
        disabled={disabled}
        onClick={() => onChange(color.name)}
        className="rounded-full p-1 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
      >
        <Swatch color={color} isSelected={color.name === value} />
      </button>
    ))}
  </div>
);
