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
        ghost: "hover:bg-slate-100",
        light: "border border-slate-200 bg-white shadow-sm hover:bg-slate-50",
        outline: "border border-white/30 bg-white/10 shadow-sm backdrop-blur hover:bg-white/20",
        primary: "bg-cyan-400 shadow-sm shadow-cyan-950/10 hover:bg-cyan-300",
        secondary: "bg-slate-950 hover:bg-slate-800",
      },
    },
  },
);

const buttonTextColor = {
  ghost: "#334155",
  light: "#0f172a",
  outline: "#ffffff",
  primary: "#101820",
  secondary: "#ffffff",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ asChild, className, size, style, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const selectedVariant = variant ?? "primary";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      style={{ color: buttonTextColor[selectedVariant], ...style }}
      {...props}
    />
  );
}
