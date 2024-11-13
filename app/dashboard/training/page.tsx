"use client";

import { useState } from "react";
import { useTraining } from "@/hooks/use-training";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateCourseDialog } from "@/components/training/create-course-dialog";
import { ProgressCard } from "@/components/training/progress-card";
import { TrainingOverview } from "@/components/training/training-overview";
import { AchievementNotification } from "@/components/training/achievement-notification";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RecentActivity } from "@/components/training/recent-activity";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRoles } from "@/hooks/use-roles";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CourseData {
  title: string;
  description: string;
  totalLessons: number;
  imageUrl: string;
}

const categories = [
  { id: "all", name: "All Courses", color: "" },
  { id: "in-progress", name: "In Progress", color: "" },
  { id: "completed", name: "Completed", color: "" },
  { id: "not-started", name: "Not Started", color: "" },
];

export default function TrainingDashboard() {
  const { courses, userProgress, recentActivities, loading } = useTraining();
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const supabase = createClientComponentClient();

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const progress = userProgress[course.id];
    const isCompleted = progress?.completed_lessons === course.total_lessons;
    const isStarted = progress?.completed_lessons > 0;

    switch (selectedCategory) {
      case "completed":
        return matchesSearch && isCompleted;
      case "in-progress":
        return matchesSearch && isStarted && !isCompleted;
      case "not-started":
        return matchesSearch && !isStarted;
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  const totalLessons = courses?.reduce((acc, course) => acc + course.total_lessons, 0) || 0;
  const completedLessons = Object.values(userProgress).reduce((acc, progress) => 
    acc + (progress?.completed_lessons || 0), 0
  );

  const handleCreateCourse = async (courseData: CourseData) => {
    try {
      const { error } = await supabase
        .from('training_courses')
        .insert([
          {
            title: courseData.title,
            description: courseData.description,
            total_lessons: courseData.totalLessons,
            image_url: courseData.imageUrl
          }
        ]);

      if (error) throw error;
      
      window.location.reload();
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Dashboard</h1>
          <p className="text-muted-foreground">
            Track your learning progress and achievements
          </p>
        </div>
        {isAdmin() && (
          <>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
            <CreateCourseDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onCreateCourse={handleCreateCourse}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <TrainingOverview
            totalCourses={courses?.length || 0}
            completedCourses={courses?.filter(course => 
              userProgress[course.id]?.completed_lessons === course.total_lessons
            ).length || 0}
            totalLessons={totalLessons}
            completedLessons={completedLessons}
          />

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {categories.map((category: Category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-primary/90",
                    selectedCategory === category.id && "bg-primary"
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {(!filteredCourses || filteredCourses.length === 0) ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">No courses found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Check back later for new training courses"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <ProgressCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description || ''}
                  progress={(userProgress[course.id]?.completed_lessons || 0) / course.total_lessons * 100}
                  completedCount={userProgress[course.id]?.completed_lessons || 0}
                  totalCount={course.total_lessons}
                  categories={course.categories}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities || []} />
        </div>
      </div>

      <CreateCourseDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onCreateCourse={handleCreateCourse}
      />
    </div>
  );
}