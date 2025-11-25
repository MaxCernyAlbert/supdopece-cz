import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Šup do pece',
  description: 'Administrace objednávek a zákazníků',
  manifest: '/manifest-admin.json',
  themeColor: '#dc2626',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'Admin - Šup do pece',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
