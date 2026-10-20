import { ArrowDownUp } from "lucide-react";
import { NOTE_SORTS } from "@/lib/noteSorts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Button next to the search bar that picks the order of the notes list. On
// phones it shows only the icon.
const SortMenu = ({ value, onChange }) => {
  const current = NOTE_SORTS.find((sort) => sort.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="h-10"
          aria-label={`Sort: ${current.label}`}
        >
          <ArrowDownUp />
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {NOTE_SORTS.map((sort) => (
            <DropdownMenuRadioItem
              key={sort.value}
              value={sort.value}
              className="cursor-pointer"
            >
              {sort.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortMenu;
