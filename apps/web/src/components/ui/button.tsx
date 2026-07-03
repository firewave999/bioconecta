import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[8px] text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
    variants: {
      size: {
        md: "h-11 gap-2 px-5",
        sm: "h-9 gap-2 px-3",
      },
      variant: {
        ghost: "text-slate-700 hover:bg-slate-100",
        outline:
          "border border-white/30 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/20",
        primary: "bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-950/10 hover:bg-cyan-300",
        secondary: "bg-slate-950 text-white hover:bg-slate-800",
      },
    },
  },
);

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ asChild, className, size, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}
