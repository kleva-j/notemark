import type { ComponentProps } from "react";

import { useTheme } from "@/components/theme-provider";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useId } from "react";

type ToggleModeProps = Pick<ComponentProps<"div">, "className">;

export function ToggleMode({ className }: ToggleModeProps) {
  const id = useId();

  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === "dark";

  const handlePressedChange = (pressed: boolean) => {
    setTheme(pressed ? "dark" : "light");
  };

  return (
    <div>
      <Toggle
        id={id}
        size="sm"
        pressed={isDarkMode}
        aria-label="Toggle Theme"
        className={cn(className)}
        onPressedChange={handlePressedChange}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </Toggle>

      <Label htmlFor={id} className="sr-only">
        Toggle dark mode
      </Label>
    </div>
  );
}
