import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "수강권",
  description: "보유하신 수강권 현황을 확인하세요.",
};

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
