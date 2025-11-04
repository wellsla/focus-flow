import FeaturesShell from "./FeaturesShell";
import MinimalFeaturesShell from "./MinimalFeaturesShell";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component layout that delegates to a client shell to avoid chunking the app/(features)/layout directly.
  // Use full shell by default; safe mode available via NEXT_PUBLIC_FEATURE_SHELL_SAFE=true if needed for debugging.
  const useMinimal = process.env.NEXT_PUBLIC_FEATURE_SHELL_SAFE === "true";
  if (useMinimal) {
    return <MinimalFeaturesShell>{children}</MinimalFeaturesShell>;
  }
  return <FeaturesShell>{children}</FeaturesShell>;
}
