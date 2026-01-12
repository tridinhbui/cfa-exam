import { PricingSection } from '@/components/pricing-section';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'Choose the best plan for your CFA exam preparation.',
};

export default function PricingPage() {
    return (
        <div className="max-w-7xl mx-auto -mt-8">
            <PricingSection />
        </div>
    );
}
