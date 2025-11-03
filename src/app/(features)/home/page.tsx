"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, CalendarCheck, Target } from "lucide-react";
import { motion } from "framer-motion";
import { motivationalPhrases } from "@/lib/motivational-phrases";
import { useState, useEffect } from "react";
import Link from "next/link";

const QuickLinkCard = ({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) => (
  <Link href={href} className="block hover:no-underline">
    <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-transform">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Icon className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  </Link>
);

export default function HomePage() {
  const { user } = useUser();
  // Avoid hydration mismatch: pick a deterministic quote on the server, then
  // randomize on the client after mount.
  const [quote, setQuote] = useState(() => motivationalPhrases[0]);
  useEffect(() => {
    const id = setTimeout(() => {
      setQuote(
        motivationalPhrases[
          Math.floor(Math.random() * motivationalPhrases.length)
        ]
      );
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const name = user?.name || "User";

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Welcome back, {name}.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Let&apos;s get to work.
        </p>

        <Card className="mt-8 text-left bg-card/50">
          <CardContent className="p-6">
            <blockquote className="border-l-4 border-primary pl-4 italic">
              <p className="text-lg">&ldquo;{quote.quote}&rdquo;</p>
              <footer className="mt-2 text-sm text-primary font-semibold">
                — {quote.author}
              </footer>
            </blockquote>
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <QuickLinkCard
            title="Tackle Your Routine"
            description="View and manage your daily tasks."
            icon={CalendarCheck}
            href="/routine"
          />
          <QuickLinkCard
            title="Chase Your Goals"
            description="Define and track your objectives."
            icon={Target}
            href="/goals"
          />
          <QuickLinkCard
            title="Track Applications"
            description="Manage your job search pipeline."
            icon={Briefcase}
            href="/applications"
          />
        </div>
      </motion.div>
    </div>
  );
}
