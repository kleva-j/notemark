import type { ComponentProps, ElementType } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const TypographyVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
      h2: "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "text-lg font-bold",
      h6: "text-base font-bold",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      span: "text-sm font-medium leading-none",
      code: "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      small: "text-sm leading-none font-medium",
      div: "text-sm font-medium",
    },
  },
  defaultVariants: {
    variant: "div",
  },
});

type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "blockquote"
  | "code"
  | "small"
  | "div";

export type TypographyProps = ComponentProps<TypographyElement> &
  VariantProps<typeof TypographyVariants> & {
    as?: ElementType;
  };

export function Typography(props: TypographyProps) {
  const { className, variant, as: Comp = "p", ...rest } = props;

  return (
    <Comp
      className={cn(TypographyVariants({ variant, className }))}
      {...rest}
    />
  );
}
