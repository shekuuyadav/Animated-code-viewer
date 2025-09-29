import { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div {...props}>
      <div className="relative h-10 w-10">
        <span className="text-5xl font-extrabold tracking-tighter bg-gradient-to-br from-gray-200 via-gray-500 to-gray-800 bg-clip-text text-transparent leading-none -mt-1">
          X
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-white text-[0.5rem] tracking-[0.1rem] font-semibold">
          CODE
        </span>
      </div>
    </div>
  );
}
