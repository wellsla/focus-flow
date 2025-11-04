import FeaturesShell from "./FeaturesShell";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component layout that delegates to a client shell to avoid chunking the app/(features)/layout directly.
  return <FeaturesShell>{children}</FeaturesShell>;
}
