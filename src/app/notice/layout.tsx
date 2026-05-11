import { generatePageMetadata } from "@/common/utils/metaUtils";

export const metadata = generatePageMetadata('notice');

export default function NoticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
