import Image from "next/image";

interface QChanProps {
  text: string | React.ReactNode;
  position?: "left" | "right";
  pulse?: boolean;
}

export default function QChan({ text, position = "left", pulse = false }: QChanProps) {
  return (
    <div
      className={`flex items-start gap-4 my-6 p-4 md:p-5 rounded-2xl bg-brand-yellow-light border border-brand-yellow/60 shadow-sm transition-all duration-300 ${
        position === "right" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Q-chan Image Avatar */}
      <div className="flex-shrink-0 relative group">
        <div
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-brand-orange bg-white shadow-md relative ${
            pulse ? "animate-pulse" : ""
          } group-hover:scale-105 transition-transform duration-300`}
        >
          <Image
            src="/assets/q_jiang.jpg"
            alt="導覽員 Q醬"
            fill
            sizes="(max-width: 768px) 56px, 64px"
            className="object-cover object-top"
          />
        </div>
        {/* Hairpin/Accessory indicator decoration */}
        <div className="absolute -top-1 -right-1 bg-brand-orange text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm">
          Q
        </div>
      </div>

      {/* Dialog Bubble */}
      <div className="flex-grow space-y-1 relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-orange tracking-wider bg-brand-peach-light px-2.5 py-0.5 rounded-full">
            導覽員 Q醬
          </span>
          <span className="text-[10px] text-brand-muted font-medium">
            Mascot Guideline
          </span>
        </div>
        
        <div className="text-sm md:text-base text-brand-dark leading-relaxed font-medium">
          {typeof text === "string" ? (
            <p className="whitespace-pre-line">{text}</p>
          ) : (
            text
          )}
        </div>

        {/* Small bubble tail */}
        <div
          className={`absolute top-5 w-3 h-3 bg-brand-yellow-light border-t border-l border-brand-yellow/40 transform -rotate-45 ${
            position === "right"
              ? "-right-[21px] md:-right-[25px] rotate-135"
              : "-left-[21px] md:-left-[25px]"
          }`}
        />
      </div>
    </div>
  );
}
