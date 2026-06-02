import type { Metadata } from "next";
import { generatePageMetadata } from "@/common/utils/metaUtils";

export const metadata: Metadata = generatePageMetadata('reserve');

export default function ReserveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
