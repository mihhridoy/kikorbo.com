import type { Metadata } from 'next';
import { BecomeAnExpertClient } from './BecomeAnExpertClient';

export const metadata: Metadata = { title: 'Become an Expert | Poramorshoo' };

export default function BecomeAnExpertPage() {
  return <BecomeAnExpertClient />;
}
