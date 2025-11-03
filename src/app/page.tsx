"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { placeHolderImages } from "@/lib/placeholder-images";
import Logo from "@/components/logo";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

const HomePageContent = () => {
  const heroImage = placeHolderImages.find(
    (image) => image.id === "hero-image"
  );

  const features = [
    "Task and Job Application Tracking",
    "Financial Management & AI Insights",
    "Personalized Investment Tips",
    "Performance Dashboards",
    "Time Management Assistance",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <Logo />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <a href="/auth/login">Login</a>
          </Button>
          <Button asChild>
            <a href="/auth/login">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full pt-24 md:pt-32 lg:pt-40">
          <div className="container px-4 md:px-6 grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                  Stop Drifting. Start Achieving.
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  FocusFlow is the reality check you need. An unforgiving
                  dashboard to organize your tasks, manage your finances, and
                  track your job search. No excuses, just results.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <a href="/auth/login">Find your proposite</a>
                </Button>
              </div>
            </div>
            <div className="relative">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
                  Everything You Need to Get Back on Track
                </h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A suite of tools designed to provide clarity and drive action,
                  with a dose of tough love.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-card/50 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6 grid gap-4">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="h-8 w-8 text-accent" />
                      <h3 className="text-lg font-bold font-headline">
                        {feature}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">
          &copy; {new Date().getFullYear()} FocusFlow. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-foreground/80"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-foreground/80"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/home");
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && user)) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  return <HomePageContent />;
}
