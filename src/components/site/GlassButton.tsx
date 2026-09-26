import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        glass:
          "glass text-foreground hover:border-primary/40 hover:text-primary",
        lime: "bg-primary text-primary-foreground glow-lime hover:brightness-110",
        ghost:
          "border border-transparent text-muted-foreground hover:glass-soft hover:text-foreground",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "glass", size: "md" },
  },
);

export type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof glassButtonVariants>;

export function GlassButton({
  className,
  variant,
  size,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={cn(glassButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
