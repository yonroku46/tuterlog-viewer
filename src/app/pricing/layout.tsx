import { generatePageMetadata } from "@/common/utils/metaUtils";

export const metadata = generatePageMetadata('pricing');

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
