import type { Metadata } from "next";
import { generatePageMetadata } from "@/common/utils/metaUtils";

export const metadata: Metadata = generatePageMetadata('profile');

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
