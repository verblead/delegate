"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionFeedback {
  id: string;
  question_text: string;
  selected_choice: string;
  correct_choice: string;
  is_correct: boolean;
  explanation?: string;
  points_earned: number;
  points_possible: number;
}

interface AssessmentFeedbackProps {
  feedback: QuestionFeedback[];
  totalScore: number;
  passingScore: number;
}

export function AssessmentFeedback({
  feedback,
  totalScore,
  passingScore,
}: AssessmentFeedbackProps) {
  const passed = totalScore >= passingScore;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Detailed Feedback</h3>
            <Badge variant={passed ? "default" : "destructive"}>
              {totalScore}% Score
            </Badge>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              Review your answers below. Pay special attention to any incorrect answers
              and their explanations to improve your understanding.
            </p>
          </div>

          <ScrollArea className="h-[400px] mt-4">
            <div className="space-y-6">
              {feedback.map((item, index) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <Badge variant={item.is_correct ? "default" : "destructive"}>
                          {item.points_earned}/{item.points_possible} points
                        </Badge>
                      </div>
                      <p>{item.question_text}</p>
                    </div>
                    {item.is_correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className={cn(
                      "p-3 rounded-md",
                      item.is_correct ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      <p className="text-sm font-medium">Your Answer:</p>
                      <p className="text-sm">{item.selected_choice}</p>
                    </div>

                    {!item.is_correct && (
                      <div className="p-3 rounded-md bg-green-500/10">
                        <p className="text-sm font-medium">Correct Answer:</p>
                        <p className="text-sm">{item.correct_choice}</p>
                      </div>
                    )}

                    {item.explanation && (
                      <div className="p-3 rounded-md bg-muted">
                        <p className="text-sm font-medium">Explanation:</p>
                        <p className="text-sm text-muted-foreground">
                          {item.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}