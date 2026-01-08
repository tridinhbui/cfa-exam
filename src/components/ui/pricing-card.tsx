"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NumberFlow } from "./number-flow"
import { cn } from "@/lib/utils"

export interface PricingTier {
    name: string
    price: {
        monthly: number
        yearly: number
    }
    description: string
    features: string[]
    cta: string
    popular?: boolean
}

interface PricingCardProps {
    tier: PricingTier
    paymentFrequency: string
}

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
    const currentPrice = paymentFrequency === "yearly" ? tier.price.yearly : tier.price.monthly

    return (
        <Card className={cn(
            "relative flex flex-col overflow-hidden transition-all hover:shadow-xl",
            tier.popular ? "border-primary ring-1 ring-primary" : "border-border"
        )}>
            {tier.popular && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Popular
                </div>
            )}
            <CardContent className="flex flex-1 flex-col p-8">
                <div className="mb-8">
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$</span>
                    <span className="text-5xl font-extrabold tracking-tight">
                        <NumberFlow value={currentPrice} />
                    </span>
                    <span className="text-muted-foreground">
                        /{paymentFrequency === "yearly" ? "yr" : "mo"}
                    </span>
                </div>

                <div className="mb-10 space-y-4 flex-grow">
                    {tier.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                <Button
                    className="w-full h-12 rounded-xl font-bold"
                    variant={tier.popular ? "default" : "outline"}
                >
                    {tier.cta}
                </Button>
            </CardContent>
        </Card>
    )
}
