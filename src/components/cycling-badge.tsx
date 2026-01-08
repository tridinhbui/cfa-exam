import { VaporizeTextCycle, Tag } from './vaporize-text';

const WORDS = ['ENGAGING', 'AI-POWERED', 'ADAPTIVE', 'PERSONAL'];

export function CyclingBadge() {
    return (
        <span
            className="inline-block relative ml-2 align-baseline translate-y-[4px]"
        >
            <VaporizeTextCycle
                texts={WORDS}
                font={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "44px",
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
                alignment="left"
                tag={Tag.SPAN}
                className="w-[300px] h-[60px]"
            />
        </span>
    );
}
