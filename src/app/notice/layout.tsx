import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
  description: "센터와 서비스 공지사항을 확인하세요.",
};

export default function NoticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
