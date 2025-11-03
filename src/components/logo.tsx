import Image from 'next/image';

import { cn } from '@/lib/utils';

export default function Logo({ className, isCollapsed }: { className?: string, isCollapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/img/Logo.png" alt="Logo" width={42} height={42} className="text-primary" />
      <span className={cn("font-headline text-xl font-bold text-primary", isCollapsed && "hidden")}>
        FocusFlow
      </span>
    </div>
  );
}
