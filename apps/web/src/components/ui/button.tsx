import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[8px] text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:pointer-events-none disabled:opacity-50",
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
        light:
          "border border-slate-200 bg-white shadow-sm shadow-slate-950/5 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md",
        outline:
          "border border-white/30 bg-white/10 shadow-sm shadow-black/10 backdrop-blur hover:-translate-y-0.5 hover:bg-white/20",
        primary:
          "bg-[linear-gradient(135deg,#1ee4f2,#16d0df_48%,#7dd3fc)] shadow-lg shadow-cyan-950/15 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-950/20",
        secondary:
          "bg-[linear-gradient(135deg,#020617,#0f2930)] shadow-lg shadow-slate-950/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/25",
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
