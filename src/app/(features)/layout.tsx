import FeaturesShell from "./FeaturesShell";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FeaturesShell>{children}</FeaturesShell>;
}
