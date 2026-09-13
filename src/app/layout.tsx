import './globals.css';
import { Header } from '@/components/Header';

export const metadata = {
  title: 'LLD Studio | Low-Level Design Practice Platform',
  description: 'Interactive low-level design practice platform with multi-dimensional explainable feedback and attempt progression.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <p>LLD Practice Platform • 2-Day Engineering Prototype • Focus on Learner Journey & Explainable Evaluation</p>
        </footer>
      </body>
    </html>
  );
}
