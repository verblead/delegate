"use client";

import { useState } from "react";
import { useTraining } from "@/hooks/use-training";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  BookOpen, 
  GraduationCap, 
  BarChart2, 
  Clock,
  PlayCircle,
  FileText,
  Presentation,
  ChevronRight,
  Trophy
} from "lucide-react";

export default function TrainingPage() {
  const { courses, userProgress, loading } = useTraining();
  const [selectedTab, setSelectedTab] = useState("all");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500";
      case "advanced":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Center</h1>
          <p className="text-muted-foreground">
            Enhance your skills with our comprehensive training courses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Trophy className="h-4 w-4" />
            My Achievements
          </Button>
          <Button>
            <GraduationCap className="h-4 w-4 mr-2" />
            Continue Learning
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Courses Started
              </p>
              <h3 className="text-2xl font-bold">
                {courses.filter(c => userProgress[c.id]).length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <GraduationCap className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <h3 className="text-2xl font-bold">
                {courses.filter(c => 
                  userProgress[c.id]?.status === "completed"
                ).length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <BarChart2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </p>
              <h3 className="text-2xl font-bold">
                {Math.round(
                  (Object.values(userProgress).reduce(
                    (acc, curr) => acc + (curr?.progress_percent || 0), 
                    0
                  ) / (courses.length * 100)) * 100
                )}%
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Hours Spent
              </p>
              <h3 className="text-2xl font-bold">
                {Object.values(userProgress).reduce(
                  (acc, curr) => acc + (curr?.duration_minutes || 0), 
                  0
                ) / 60}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Listing */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const progress = userProgress[course.id];
                return (
                  <Card key={course.id} className="flex flex-col">
                    <div 
                      className="h-48 bg-cover bg-center rounded-t-lg"
                      style={{ 
                        backgroundImage: `url(${course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'})` 
                      }}
                    />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2 flex-1">
                        {course.description}
                      </p>

                      <div className="mt-6 space-y-4">
                        {progress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {progress.progress_percent}%
                              </span>
                            </div>
                            <Progress value={progress.progress_percent} />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.estimated_hours}h
                            </div>
                          </div>
                          <Button>
                            {progress ? "Continue" : "Start Course"}
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses
                .filter(course => 
                  userProgress[course.id]?.status === "in_progress"
                )
                .map((course) => {
                  const progress = userProgress[course.id];
                  return (
                    <Card key={course.id} className="flex flex-col">
                      <div 
                        className="h-48 bg-cover bg-center rounded-t-lg"
                        style={{ 
                          backgroundImage: `url(${course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'})` 
                        }}
                      />
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2 flex-1">
                          {course.description}
                        </p>

                        <div className="mt-6 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {progress?.progress_percent}%
                              </span>
                            </div>
                            <Progress value={progress?.progress_percent} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {course.estimated_hours}h
                              </div>
                            </div>
                            <Button>
                              Continue
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses
                .filter(course => 
                  userProgress[course.id]?.status === "completed"
                )
                .map((course) => {
                  const progress = userProgress[course.id];
                  return (
                    <Card key={course.id} className="flex flex-col">
                      <div 
                        className="h-48 bg-cover bg-center rounded-t-lg"
                        style={{ 
                          backgroundImage: `url(${course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'})` 
                        }}
                      />
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2 flex-1">
                          {course.description}
                        </p>

                        <div className="mt-6 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Completed</span>
                              <span className="font-medium">
                                {new Date(progress?.completed_at || "").toLocaleDateString()}
                              </span>
                            </div>
                            <Progress value={100} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {course.estimated_hours}h
                              </div>
                            </div>
                            <Button variant="outline">
                              Review Course
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}