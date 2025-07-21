import type { ComponentProps } from "react";
import type { NoteInfo } from "@/models";

import { formatDistanceStrict } from "date-fns";
import { cn } from "@/lib/utils";

interface NotePreviewProps extends ComponentProps<"div"> {
  note: NoteInfo;
  isActive?: boolean;
  onClick?: () => void;
}

export const NotePreview = (props: NotePreviewProps) => {
  const { note, isActive = false, onClick, ...rest } = props;
  const { id, title, updatedAt, description } = note;

  const now = new Date();
  const newDate = formatDistanceStrict(updatedAt ?? now, now);

  return (
    <div
      key={id}
      className={cn(
        "flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-1 cursor-pointer transition-all duration-200 ease-linear",
        {
          "bg-primary text-primary-foreground": isActive,
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground":
            !isActive,
        }
      )}
      onClick={onClick}
      {...rest}
    >
      <div className="flex w-full items-center gap-2">
        <span className="font-bold text-base">{title}</span>
        <span className="ml-auto text-xs">{newDate}</span>
      </div>
      <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
        {description}
      </span>
    </div>
  );
};
