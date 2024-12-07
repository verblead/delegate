"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/hooks/use-supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  Trophy,
  ChevronLeft,
  Star,
  Users,
  GraduationCap,
  MessageSquare,
  Bookmark,
  StickyNote,
  BarChart,
  Lock,
  Medal
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ContentViewer } from "@/components/training/content-viewer";
import { AssessmentQuiz } from "@/components/training/assessment-quiz";
import { AssessmentResults } from "@/components/training/assessment-results";
import { useAssessments } from "@/hooks/use-assessments";
import { useTrainingContent } from "@/hooks/use-training-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CourseNotes } from "@/components/training/course-notes";
import { CourseDiscussion } from "@/components/training/course-discussion";
import { CourseMap } from "@/components/training/course-map";
import { cn } from "@/lib/utils";

interface Instructor {
  id: string;
  name: string;
  avatar_url: string;
  title: string;
}

interface CourseStats {
  enrolled: number;
  completed: number;
  avgRating: number;
  reviewCount: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { supabase } = useSupabase();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const { content, updateProgress } = useTrainingContent(courseId);
  const { assessments, submitAttempt } = useAssessments(courseId);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Fetch course details with instructor info
        const { data: courseData, error: courseError } = await supabase
          .from("training_courses")
          .select(`
            *,
            instructor:profiles(
              id,
              username,
              avatar_url,
              title
            )
          `)
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;

        // Fetch course stats
        const { data: statsData } = await supabase
          .from("course_stats")
          .select("*")
          .eq("course_id", courseId)
          .single();

        // Fetch lessons with progress
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("training_lessons")
          .select(`
            *,
            user_progress:user_lesson_progress(
              completed,
              last_accessed
            )
          `)
          .eq("course_id", courseId)
          .order("sequence");

        if (lessonsError) throw lessonsError;

        // Fetch bookmarks
        const { data: bookmarksData } = await supabase
          .from("lesson_bookmarks")
          .select("lesson_id")
          .eq("course_id", courseId);

        setCourse(courseData);
        setInstructor(courseData.instructor);
        setStats(statsData);
        setLessons(lessonsData || []);
        setBookmarkedLessons(bookmarksData?.map(b => b.lesson_id) || []);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, supabase]);

  const toggleBookmark = async (lessonId: string) => {
    const isBookmarked = bookmarkedLessons.includes(lessonId);
    
    if (isBookmarked) {
      await supabase
        .from("lesson_bookmarks")
        .delete()
        .eq("lesson_id", lessonId);
      setBookmarkedLessons(prev => prev.filter(id => id !== lessonId));
    } else {
      await supabase
        .from("lesson_bookmarks")
        .insert({ lesson_id: lessonId, course_id: courseId });
      setBookmarkedLessons(prev => [...prev, lessonId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <p className="text-muted-foreground mt-2">
            The course you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/training">Back to Training</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progress = (completedLessons / lessons.length) * 100;

  return (
    <div className="container py-6 space-y-6">
      {/* Course Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/training">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Link>
        </Button>
      </div>

      {/* Course Overview */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {course.difficulty} Level
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.estimated_hours} hours
                    </Badge>
                    <Badge variant="outline">
                      <Trophy className="h-4 w-4 mr-1" />
                      {course.points_reward} points
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="ml-1 font-medium">{stats?.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({stats?.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {stats?.enrolled} enrolled
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {completedLessons} of {lessons.length} lessons completed
                </span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Course Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">
                <BookOpen className="h-4 w-4 mr-2" />
                Course Content
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </TabsTrigger>
              <TabsTrigger value="notes">
                <StickyNote className="h-4 w-4 mr-2" />
                My Notes
              </TabsTrigger>
              <TabsTrigger value="progress">
                <BarChart className="h-4 w-4 mr-2" />
                My Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              {content?.map((item) => (
                <ContentViewer
                  key={item.id}
                  content={item}
                  onProgress={(progress, lastPosition) => 
                    updateProgress(item.id, progress, lastPosition)
                  }
                  onComplete={() => updateProgress(item.id, 100)}
                />
              ))}
            </TabsContent>

            <TabsContent value="discussion" className="mt-4">
              <CourseDiscussion courseId={courseId} />
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <CourseNotes courseId={courseId} />
            </TabsContent>

            <TabsContent value="progress" className="mt-4">
              <CourseMap 
                lessons={lessons}
                currentLesson={content?.[0]?.lesson_id}
                onLessonSelect={(lessonId) => {
                  // Handle lesson selection
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={instructor?.avatar_url} />
                  <AvatarFallback>
                    {instructor?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{instructor?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {instructor?.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Lessons</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-px">
                  {lessons.map((lesson, index) => {
                    const isLocked = index > 0 && !lessons[index - 1].completed;
                    const isBookmarked = bookmarkedLessons.includes(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        href={isLocked ? "#" : `/dashboard/training/${courseId}/${lesson.id}`}
                      >
                        <div className={cn(
                          "p-4 hover:bg-muted/50 transition-colors",
                          isLocked && "opacity-50 cursor-not-allowed"
                        )}>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {index + 1}. {lesson.title}
                                </span>
                                {isLocked ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                ) : lesson.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : lesson.last_accessed ? (
                                  <PlayCircle className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {lesson.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleBookmark(lesson.id);
                              }}
                            >
                              <Bookmark 
                                className={cn(
                                  "h-4 w-4",
                                  isBookmarked && "fill-current text-primary"
                                )} 
                              />
                            </Button>
                          </div>
                          {lesson.last_accessed && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Last accessed{" "}
                              {formatDistanceToNow(new Date(lesson.last_accessed), {
                                addSuffix: true,
                              })}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Rewards Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{course.points_reward} Points</p>
                  <p className="text-sm text-muted-foreground">
                    Complete the course
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Medal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Course Certificate</p>
                  <p className="text-sm text-muted-foreground">
                    Pass all assessments
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Achievement Badge</p>
                  <p className="text-sm text-muted-foreground">
                    Score 90% or higher
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}