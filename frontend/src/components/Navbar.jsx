import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage, getInitials } from "@/lib/helper";
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
        <Link to="/" aria-label="Good Notes home">
          <Logo />
        </Link>

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

            <DropdownMenuContent align="end" className="w-56">
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
