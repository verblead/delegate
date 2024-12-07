"use client";

import { useState } from "react";
import { useTraining } from "@/hooks/use-training";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  Trophy,
  Zap,
  GraduationCap,
  RefreshCw,
  Filter
} from "lucide-react";
import { CreateCourseDialog } from "@/components/training/create-course-dialog";
import { ProgressCard } from "@/components/training/progress-card";
import { TrainingOverview } from "@/components/training/training-overview";
import { RecentActivity } from "@/components/training/recent-activity";
import { cn } from "@/lib/utils";
import { useRoles } from "@/hooks/use-roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const filters = [
  { id: "all", name: "All Courses" },
  { id: "in-progress", name: "In Progress" },
  { id: "completed", name: "Completed" },
  { id: "not-started", name: "Not Started" },
];

export default function TrainingDashboard() {
  const { courses, userProgress, recentActivities, loading } = useTraining();
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const progress = userProgress[course.id];
    const isCompleted = progress?.completed_lessons === course.total_lessons;
    const isStarted = progress?.completed_lessons > 0;

    switch (selectedFilter) {
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

  const sortedCourses = [...(filteredCourses || [])].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "progress":
        const progressA = (userProgress[a.id]?.completed_lessons || 0) / a.total_lessons;
        const progressB = (userProgress[b.id]?.completed_lessons || 0) / b.total_lessons;
        return progressB - progressA;
      case "lessons":
        return b.total_lessons - a.total_lessons;
      default:
        return 0;
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

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Dashboard</h1>
          <p className="text-muted-foreground">
            Track your learning progress and achievements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Course Progress
              </p>
              <h3 className="text-2xl font-bold">
                {completedLessons}/{totalLessons}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <GraduationCap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed Courses
              </p>
              <h3 className="text-2xl font-bold">
                {courses?.filter(course => 
                  userProgress[course.id]?.completed_lessons === course.total_lessons
                ).length || 0}
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
                Time Spent
              </p>
              <h3 className="text-2xl font-bold">12.5h</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Points Earned
              </p>
              <h3 className="text-2xl font-bold">250</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer hover:bg-primary/90",
                  selectedFilter === filter.id && "bg-primary"
                )}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="lessons">Lesson Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedCourses?.map((course) => (
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
        {sortedCourses?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Check back later for new training courses"}
            </p>
          </div>
        )}
      </div>

      <CreateCourseDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onCreateCourse={async (courseData) => {
          // Handle course creation
        }}
      />
    </div>
  );
}