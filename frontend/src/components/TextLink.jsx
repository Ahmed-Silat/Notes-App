import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// A router <Link> that can be disabled, e.g. while a form is submitting
// (a <fieldset disabled> doesn't cover links). Disabled, it renders without an
// href, so it can't be clicked, focused or opened in a new tab.
const TextLink = ({ disabled = false, className, children, ...props }) => {
  if (disabled) {
    return (
      <a
        role="link"
        aria-disabled="true"
        className={cn("pointer-events-none opacity-50", className)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={className} {...props}>
      {children}
    </Link>
  );
};

export default TextLink;
