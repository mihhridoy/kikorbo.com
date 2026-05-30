import type { Metadata } from 'next';
import { HowItWorksClient } from './HowItWorksClient';

export const metadata: Metadata = { title: 'How It Works | Poramorshoo' };

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
