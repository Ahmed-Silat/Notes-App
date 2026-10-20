import { saveStateNow } from "@/redux/store";
import { Archive, LogOut, Settings, StickyNote } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage, getInitials } from "@/lib/helper";
import { cn } from "@/lib/utils";
import {
  signoutFailure,
  signoutStart,
  signoutSuccess,
} from "@/redux/user/userSlice";
import { signout } from "@/Service/AuthService";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { to: "/", label: "Notes", icon: StickyNote },
  { to: "/archive", label: "Archive", icon: Archive },
];

const Navbar = ({ onLoggingOutChange }) => {
  const { currentUser } = useSelector((state) => state.user);
  const userName = currentUser?.rest?.username || "--";
  const email = currentUser?.rest?.email;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onLogout = async () => {
    onLoggingOutChange?.(true);

    try {
      dispatch(signoutStart());
      const res = await signout();

      if (res.data.success === false) {
        dispatch(signoutFailure(res.data.message));
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      dispatch(signoutSuccess());
      await saveStateNow();
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
      dispatch(signoutFailure(error.response?.data?.message));
    } finally {
      // on success the layout has already unmounted, so this only matters on failure
      onLoggingOutChange?.(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" aria-label="Good Notes home">
            <Logo />
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                aria-label={label}
                className={({ isActive }) =>
                  cn(
                    "flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                    isActive && "bg-accent text-foreground"
                  )
                }
              >
                <Icon className="size-4" />
                {/* icon only on phones, next to the logo */}
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-full pr-3 pl-1">
                <Avatar>
                  <AvatarFallback className="bg-brand text-xs font-semibold text-brand-foreground">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium capitalize sm:inline">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 ease-out data-open:duration-200 data-closed:duration-450 motion-reduce:animate-none! motion-reduce:transition-none!"
            >
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="truncate font-medium capitalize text-foreground">
                  {userName}
                </span>
                {email && (
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {email}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/settings">
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onSelect={onLogout}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
