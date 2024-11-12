import {
  MessageSquare,
  Users,
  Trophy,
  BarChart4,
  Lock,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description:
      "Instant communication with rich text editing, threads, and file sharing.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Organize teams, channels, and permissions with intuitive controls.",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Boost engagement with points, achievements, and custom rewards.",
  },
  {
    icon: BarChart4,
    title: "Analytics",
    description:
      "Track team performance and engagement with detailed insights.",
  },
  {
    icon: Lock,
    title: "Security",
    description:
      "Enterprise-grade security with role-based access control.",
  },
  {
    icon: Zap,
    title: "Integrations",
    description:
      "Connect with your favorite tools for seamless workflows.",
  },
];

export function LandingFeatures() {
  return (
    <section className="container py-12 md:py-24 px-4">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight sm:text-4xl mb-4 px-4">
          Everything you need to manage your team
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-[800px] mx-auto px-4">
          Powerful features to help your team collaborate, stay organized, and achieve more together.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="relative overflow-hidden rounded-lg border bg-background p-6 md:p-8 transition-all hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg md:text-xl font-bold">{feature.title}</h3>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-16 text-center px-4">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/register">
            Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}