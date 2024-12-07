"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, Trophy, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentResult {
  id: string;
  score: number;
  passed: boolean;
  completed_at: string;
}

interface AssessmentResultsProps {
  results: AssessmentResult[];
  passingScore: number;
  attemptsAllowed: number;
}

export function AssessmentResults({
  results,
  passingScore,
  attemptsAllowed,
}: AssessmentResultsProps) {
  const sortedResults = [...results].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  const bestScore = Math.max(...results.map((r) => r.score));
  const hasPassed = results.some((r) => r.passed);
  const attemptsRemaining = attemptsAllowed - results.length;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Assessment History</h3>
          <div className="flex items-center gap-2">
            <Badge variant={hasPassed ? "default" : "secondary"}>
              {hasPassed ? (
                <>
                  <Trophy className="h-3 w-3 mr-1" />
                  Passed
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  {attemptsRemaining} attempts remaining
                </>
              )}
            </Badge>
            <Badge variant="outline">Best: {bestScore}%</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Passing Score</span>
            <span>{passingScore}%</span>
          </div>
          <Progress value={passingScore} className="h-2" />
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {sortedResults.map((result) => (
              <Card
                key={result.id}
                className={cn(
                  "p-4 transition-colors",
                  result.passed ? "bg-primary/5" : "bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="font-medium">
                        Attempt #{sortedResults.indexOf(result) + 1}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(result.completed_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={result.passed ? "default" : "destructive"}
                    className="ml-auto"
                  >
                    {result.score}%
                  </Badge>
                </div>
              </Card>
            ))}
            {results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No attempts yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}