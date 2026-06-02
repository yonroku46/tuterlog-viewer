import { generatePageMetadata } from '@/common/utils/metaUtils';
import { Geist, Geist_Mono } from "next/font/google";
import ScrollToTop from "@/components/layout/ScrollToTop";
import MainWrapper from "@/components/layout/MainWrapper";
import { AuthProvider } from '@/providers/AuthProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import SnackbarProvider from '@/providers/SnackbarProvider';
import "@/styles/globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = generatePageMetadata('home');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <SnackbarProvider>
              <ScrollToTop />
              <MainWrapper>
                {children}
              </MainWrapper>
            </SnackbarProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
