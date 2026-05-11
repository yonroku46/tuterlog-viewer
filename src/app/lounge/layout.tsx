import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "라운지",
  description: "라운지에서 다른 센터멤버와 소통하세요.",
};

export default function LoungeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
