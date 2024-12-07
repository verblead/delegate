"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question_text: string;
  explanation?: string;
  points: number;
  choices: {
    id: string;
    choice_text: string;
    is_correct: boolean;
  }[];
}

interface AssessmentQuizProps {
  questions: Question[];
  passingScore: number;
  onComplete: (score: number, passed: boolean) => void;
}

export function AssessmentQuiz({ questions, passingScore, onComplete }: AssessmentQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const currentPoints = Object.entries(answers).reduce((sum, [questionId, answerId]) => {
    const question = questions.find(q => q.id === questionId);
    if (question?.choices.find(c => c.id === answerId)?.is_correct) {
      return sum + (question?.points || 0);
    }
    return sum;
  }, 0);
  const score = Math.round((currentPoints / totalPoints) * 100);
  const passed = score >= passingScore;

  const handleAnswer = (questionId: string, choiceId: string) => {
    setAnswers(prev => ({ ...prev, [questionId] : choiceId }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    setSubmitted(true);
    onComplete(score, passed);
  };

  const isAnswered = (questionId: string) => questionId in answers;
  const isCorrect = (questionId: string, choiceId: string) => {
    const question = questions.find(q => q.id === questionId);
    return question?.choices.find(c => c.id === choiceId)?.is_correct;
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          {submitted && (
            <Badge variant={passed ? "default" : "destructive"}>
              {passed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Passed
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </>
              )}
            </Badge>
          )}
        </div>
        <Progress 
          value={(currentQuestion + 1) / totalQuestions * 100} 
          className="h-2"
        />
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {questions[currentQuestion].question_text}
                </h3>
                <Badge variant="secondary">
                  {questions[currentQuestion].points} points
                </Badge>
              </div>
              {questions[currentQuestion].explanation && showResults && (
                <div className="flex items-start gap-2 p-4 rounded-lg bg-muted">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm">
                    {questions[currentQuestion].explanation}
                  </p>
                </div>
              )}
            </div>

            <RadioGroup
              value={answers[questions[currentQuestion].id]}
              onValueChange={(value) => handleAnswer(questions[currentQuestion].id, value)}
              className="space-y-3"
              disabled={showResults}
            >
              {questions[currentQuestion].choices.map((choice) => {
                const isSelected = answers[questions[currentQuestion].id] === choice.id;
                const showCorrect = showResults && choice.is_correct;
                const showIncorrect = showResults && isSelected && !choice.is_correct;

                return (
                  <div key={choice.id} className="relative">
                    <RadioGroupItem
                      value={choice.id}
                      id={choice.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={choice.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                        "hover:bg-muted peer-data-[state=checked]:border-primary",
                        showCorrect && "border-green-500 bg-green-500/10",
                        showIncorrect && "border-red-500 bg-red-500/10"
                      )}
                    >
                      <span>{choice.choice_text}</span>
                      {showResults && (
                        <span>
                          {choice.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            isSelected && (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )
                          )}
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        </ScrollArea>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        {currentQuestion === totalQuestions - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < totalQuestions || submitted}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isAnswered(questions[currentQuestion].id)}
          >
            Next
          </Button>
        )}
      </div>

      {/* Results Summary */}
      {showResults && (
        <Card className="p-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quiz Results</h3>
              <Badge variant={passed ? "default" : "destructive"}>
                {score}% Score
              </Badge>
            </div>
            
            <Progress 
              value={score} 
              className="h-2"
              indicatorColor={passed ? undefined : "bg-destructive"}
            />
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Passing Score: {passingScore}%</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span>Your Score: {score}%</span>
              </div>
            </div>

            {!passed && (
              <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Quiz Failed</p>
                  <p>Please review the material and try again to achieve a passing score.</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}