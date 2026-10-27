"use client";

/**
 * Seamless infinite marquee strip. Content is duplicated for a
 * gap-free loop; hover pauses via the .pause-on-hover utility.
 */
export function Marquee({
  items,
  reverse = false,
  className,
  itemClassName,
  separator = "✦",
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: string;
}) {
  const row = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={`flex items-center whitespace-nowrap ${itemClassName ?? ""}`}>
          <span className="mx-5 md:mx-7">{item}</span>
          <span className="text-gradient text-sm opacity-70">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`pause-on-hover mask-fade-x overflow-hidden ${className ?? ""}`}>
      <div className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {row}
        {row}
      </div>
    </div>
  );
}
