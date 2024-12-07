"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

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

interface Assessment {
  id: string;
  title: string;
  description?: string;
  passing_score: number;
  attempts_allowed: number;
  questions: Question[];
  user_attempts?: {
    id: string;
    score: number;
    passed: boolean;
    completed_at: string;
  }[];
}

export function useAssessments(lessonId: string) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!lessonId || !user) return;

    const fetchAssessments = async () => {
      try {
        const { data, error } = await supabase
          .from("training_assessments")
          .select(`
            *,
            questions:assessment_questions(
              id,
              question_text,
              explanation,
              points,
              choices:question_choices(
                id,
                choice_text,
                is_correct
              )
            ),
            user_attempts:user_assessment_attempts(
              id,
              score,
              passed,
              completed_at
            )
          `)
          .eq("lesson_id", lessonId)
          .order("created_at");

        if (error) throw error;
        setAssessments(data || []);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast({
          title: "Error",
          description: "Failed to load assessments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [lessonId, user, supabase, toast]);

  const submitAttempt = async (
    assessmentId: string,
    answers: Record<string, string>
  ) => {
    if (!user) return;

    try {
      // Calculate score
      const assessment = assessments.find((a) => a.id === assessmentId);
      if (!assessment) throw new Error("Assessment not found");

      let correctAnswers = 0;
      let totalPoints = 0;

      assessment.questions.forEach((question) => {
        const selectedChoice = question.choices.find(
          (c) => c.id === answers[question.id]
        );
        if (selectedChoice?.is_correct) {
          correctAnswers += question.points;
        }
        totalPoints += question.points;
      });

      const score = Math.round((correctAnswers / totalPoints) * 100);
      const passed = score >= assessment.passing_score;

      // Create attempt record
      const { data: attempt, error: attemptError } = await supabase
        .from("user_assessment_attempts")
        .insert({
          user_id: user.id,
          assessment_id: assessmentId,
          score,
          passed,
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      // Record individual answers
      const answerPromises = Object.entries(answers).map(([questionId, choiceId]) => {
        const question = assessment.questions.find((q) => q.id === questionId);
        const choice = question?.choices.find((c) => c.id === choiceId);

        return supabase.from("user_question_answers").insert({
          attempt_id: attempt.id,
          question_id: questionId,
          selected_choice_id: choiceId,
          is_correct: choice?.is_correct || false,
        });
      });

      await Promise.all(answerPromises);

      return { score, passed };
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assessment",
        variant: "destructive",
      });
      return null;
    }
  };

  return { assessments, loading, submitAttempt };
}