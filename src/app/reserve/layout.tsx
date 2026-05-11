import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "수업예약",
  description: "수업 예약 및 스케줄 관리를 진행하세요.",
};

export default function ReserveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
