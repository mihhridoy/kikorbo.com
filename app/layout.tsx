import type { Metadata } from 'next';
import './globals.css';
import { PLATFORM } from '@/lib/constants/platform';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: `${PLATFORM.name} — ${PLATFORM.taglineEn}`,
    template: `%s | ${PLATFORM.name}`,
  },
  description: 'Poramorshoo (পরামর্শ ডট কম) — Bangladesh\'s first structured expert consultation platform. Book trusted experts for freelancing, BCS, study abroad, software career, business, and legal advice.',
  keywords: ['expert consultation', 'Bangladesh', 'freelancing mentor', 'BCS guidance', 'IELTS help', 'online consultation'],
  authors: [{ name: PLATFORM.name }],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    siteName: PLATFORM.name,
    title: `${PLATFORM.name} — ${PLATFORM.taglineEn}`,
    description: 'Bangladesh\'s first structured expert consultation platform.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
