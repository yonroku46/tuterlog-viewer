import { generatePageMetadata } from "@/common/utils/metaUtils";

export const metadata = generatePageMetadata('forgot-password');

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
