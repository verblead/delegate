"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  completedCount: number;
  totalCount: number;
  categories?: string[];
}

export function ProgressCard({
  id,
  title,
  description,
  progress,
  completedCount,
  totalCount,
  categories = []
}: ProgressCardProps) {
  const isCompleted = completedCount === totalCount;
  const isStarted = completedCount > 0;

  return (
    <Link href={`/dashboard/training/${id}`}>
      <Card className={cn(
        "hover:shadow-lg transition-shadow cursor-pointer",
        isCompleted ? "border-primary/50" : ""
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2">{title}</CardTitle>
            {isCompleted && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant="outline"
                className="bg-opacity-10"
                style={{ 
                  backgroundColor: `${category}20`,
                  borderColor: category,
                  color: category
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
          <Progress 
            value={progress} 
            className="h-2"
          />
          <div className="text-sm text-muted-foreground mt-2">
            {completedCount} of {totalCount} lessons completed
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{completedCount} of {totalCount} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>2-3 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}