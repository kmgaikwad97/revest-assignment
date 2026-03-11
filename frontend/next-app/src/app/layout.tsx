import type { Metadata } from 'next';
import MuiProvider from '@/components/MuiProvider';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Revest Assignment',
  description: 'Microservice-based application with dynamic form',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <MuiProvider>
          <NavBar />
          <main>{children}</main>
        </MuiProvider>
      </body>
    </html>
  );
}
