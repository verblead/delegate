import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";

export function LandingHero() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_100%)]" />
      
      <div className="container px-4 md:px-6 max-w-[1200px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-primary mb-4">
            <MessagesSquare className="h-6 w-6" />
            <span className="font-bold text-xl">Delegate</span>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Where Teams Thrive Together
            </span>
          </h1>
          
          <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-lg lg:text-xl px-4">
            Transform your team collaboration with real-time messaging, task management, 
            and engaging gamification features.
          </p>
          
          <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-3 mt-8 px-4">
            <Button asChild size="lg" className="w-full sm:w-auto text-base">
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-base">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 sm:flex items-center justify-center gap-6 sm:gap-8 text-muted-foreground px-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-primary">10k+</span>
              <span className="text-xs sm:text-sm text-center">Active Users</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-primary">50k+</span>
              <span className="text-xs sm:text-sm text-center">Tasks Completed</span>
            </div>
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <span className="text-2xl sm:text-3xl font-bold text-primary">99%</span>
              <span className="text-xs sm:text-sm text-center">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}