import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/sign-out-action";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className={cn("gap-1.5", className)}
      >
        <LogOut className="size-3.5" />
        Sign out
      </Button>
    </form>
  );
}
