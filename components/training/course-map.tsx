"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  sequence: number;
  completed?: boolean;
  last_accessed?: string;
}

interface CourseMapProps {
  lessons: Lesson[];
  currentLesson?: string;
  onLessonSelect: (lessonId: string) => void;
}

export function CourseMap({ lessons, currentLesson, onLessonSelect }: CourseMapProps) {
  const completedLessons = lessons.filter((l) => l.completed).length;
  const progress = (completedLessons / lessons.length) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Course Progress</h3>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {completedLessons} of {lessons.length} lessons completed
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

            <div className="space-y-4">
              {lessons.map((lesson, index) => {
                const isLocked = index > 0 && !lessons[index - 1].completed;
                const isCurrent = lesson.id === currentLesson;

                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      "relative pl-9",
                      isLocked && "opacity-50"
                    )}
                  >
                    {/* Status Indicator */}
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-background border flex items-center justify-center">
                      {lesson.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start p-4 h-auto",
                        isCurrent && "bg-muted",
                        isLocked && "cursor-not-allowed"
                      )}
                      onClick={() => !isLocked && onLessonSelect(lesson.id)}
                    >
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {index + 1}. {lesson.title}
                          </span>
                          {isCurrent && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}