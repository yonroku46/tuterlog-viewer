import { generatePageMetadata } from "@/common/utils/metaUtils";

export const metadata = generatePageMetadata('register');

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
