import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SearchBar = ({ value, onChange, onClearSearch, className }) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search notes..."
        aria-label="Search notes"
        className="h-10 bg-card pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => e.key === "Escape" && onClearSearch()}
      />

      {value && (
        <button
          type="button"
          onClick={onClearSearch}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
