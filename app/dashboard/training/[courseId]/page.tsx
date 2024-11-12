"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTraining } from "@/hooks/use-training";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  PlayCircle, 
  FileText, 
  Presentation,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function CoursePage() {
  const { courseId } = useParams();
  const { courses, userProgress, getCourseModules, loading } = useTraining();
  const [modules, setModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  const course = courses.find(c => c.id === courseId);
  const progress = userProgress[courseId as string];

  useEffect(() => {
    const loadModules = async () => {
      if (courseId) {
        const moduleData = await getCourseModules(courseId as string);
        setModules(moduleData);
        setLoadingModules(false);
      }
    };

    loadModules();
  }, [courseId, getCourseModules]);

  if (loading || loadingModules) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold">Course not found</h1>
      </div>
    );
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "slides":
        return <Presentation className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/training">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-2">
              {course.description}
            </p>
          </div>

          <div className="grid gap-4">
            {modules.map((module) => (
              <Card key={module.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    </div>
                    {module.completed && (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {module.lessons?.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getContentTypeIcon(lesson.content_type)}
                          <span className="text-sm">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {lesson.duration_minutes} min
                          </div>
                          <Button size="sm">
                            {lesson.completed ? "Review" : "Start"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Course Progress</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">
                    {progress?.progress_percent || 0}%
                  </span>
                </div>
                <Progress value={progress?.progress_percent || 0} />
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Time</span>
                  <span>{course.estimated_hours} hours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Modules</span>
                  <span>{modules.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lessons</span>
                  <span>
                    {modules.reduce(
                      (acc, module) => acc + (module.lessons?.length || 0),
                      0
                    )}
                  </span>
                </div>
              </div>

              <Button className="w-full">
                {progress ? "Continue Course" : "Start Course"}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Course Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Difficulty</span>
                <Badge variant="outline">{course.difficulty}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>
                  {new Date(course.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created By</span>
                <span>{course.created_by}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}