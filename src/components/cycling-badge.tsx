import { VaporizeTextCycle, Tag } from './vaporize-text';

const WORDS = ['ENGAGING', 'AI-POWERED', 'ADAPTIVE', 'PERSONAL'];

export function CyclingBadge() {
    return (
        <span
            className="block lg:inline-block relative lg:ml-2 align-baseline translate-y-[4px] mx-auto lg:mx-0 w-fit"
        >
            <VaporizeTextCycle
                texts={WORDS}
                font={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "44px", // Specific pixel value required for canvas rendering
                    fontWeight: 700
                }}
                color="rgb(129, 140, 248)"
                spread={2}
                density={8}
                animation={{
                    vaporizeDuration: 1.2,
                    fadeInDuration: 0.6,
                    waitDuration: 2.5
                }}
                direction="left-to-right"
                alignment="center"
                tag={Tag.SPAN}
                className="w-[280px] sm:w-[320px] h-[45px] sm:h-[60px]"
            />
        </span>
    );
}
