import { generatePageMetadata } from "@/common/utils/metaUtils";

export const metadata = generatePageMetadata('lounge');

export default function LoungeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
