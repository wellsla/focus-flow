import FeaturesShell from "./FeaturesShell";
import MinimalFeaturesShell from "./MinimalFeaturesShell";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component layout that delegates to a client shell to avoid chunking the app/(features)/layout directly.
  // Temporarily render a minimal shell to isolate and eliminate update loops across pages.
  const useMinimal = process.env.NEXT_PUBLIC_FEATURE_SHELL_SAFE !== "false";
  if (useMinimal) {
    return <MinimalFeaturesShell>{children}</MinimalFeaturesShell>;
  }
  return <FeaturesShell>{children}</FeaturesShell>;
}
