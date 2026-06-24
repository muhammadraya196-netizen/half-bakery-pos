import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  subtitle,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center mx-auto max-w-2xl",
        className
      )}
    >
      {subtitle && (
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-3">
          {subtitle}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-bakery-dark leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
      <div
        className={cn(
          "mt-6 h-1 w-16 bg-gradient-to-r from-primary to-secondary rounded-full",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}
