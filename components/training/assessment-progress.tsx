"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  answered: boolean;
  isCorrect?: boolean;
}

interface AssessmentProgressProps {
  questions: Question[];
  currentQuestion: number;
  timeRemaining?: string;
  onQuestionSelect: (index: number) => void;
  showResults?: boolean;
}

export function AssessmentProgress({
  questions,
  currentQuestion,
  timeRemaining,
  onQuestionSelect,
  showResults,
}: AssessmentProgressProps) {
  const answeredCount = questions.filter(q => q.answered).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {timeRemaining && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Time Remaining</span>
            <Badge variant="outline">{timeRemaining}</Badge>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {answeredCount} of {questions.length} questions answered
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => (
              <Button
                key={question.id}
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10",
                  index === currentQuestion && "border-primary",
                  showResults && question.isCorrect && "border-green-500 bg-green-500/10",
                  showResults && question.answered && !question.isCorrect && "border-red-500 bg-red-500/10"
                )}
                onClick={() => onQuestionSelect(index)}
              >
                {showResults ? (
                  question.answered ? (
                    question.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )
                  ) : (
                    <Circle className="h-4 w-4" />
                  )
                ) : (
                  <span className={cn(
                    "text-sm",
                    question.answered && "text-primary font-medium"
                  )}>
                    {index + 1}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}