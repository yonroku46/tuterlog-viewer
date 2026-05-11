import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "회원 정보 및 서비스 설정을 관리하세요.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
