interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <h2 className="bg-gradient-to-r from-[#1c1917] via-[#E14434] to-[#c0341f] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-[#6f675e]">{subtitle}</p>
      )}
    </div>
  );
}
