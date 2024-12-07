"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Clock, 
  Trophy,
  Plus,
  X,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCourseDialog({
  open,
  onOpenChange,
}: CreateCourseDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    total_lessons: 0,
    image_url: "",
    difficulty: "beginner",
    estimated_hours: 1,
    passing_score: 70,
    max_attempts: 3,
    categories: [] as string[],
    is_public: true,
    has_assessment: true,
    has_certificate: true,
    points_reward: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // First, insert the course
      const { data: course, error: courseError } = await supabase
        .from("training_courses")
        .insert({
          title: formData.title,
          description: formData.description,
          total_lessons: formData.total_lessons,
          image_url: formData.image_url,
          difficulty: formData.difficulty,
          estimated_hours: formData.estimated_hours,
          passing_score: formData.passing_score,
          max_attempts: formData.max_attempts,
          is_public: formData.is_public,
          has_assessment: formData.has_assessment,
          has_certificate: formData.has_certificate,
          points_reward: formData.points_reward,
          created_by: user.id
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Then, add categories if any
      if (formData.categories.length > 0 && course) {
        const categoryInserts = formData.categories.map(category => ({
          course_id: course.id,
          name: category
        }));

        const { error: categoriesError } = await supabase
          .from("training_categories")
          .insert(categoryInserts);

        if (categoriesError) throw categoriesError;
      }

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      total_lessons: 0,
      image_url: "",
      difficulty: "beginner",
      estimated_hours: 1,
      passing_score: 70,
      max_attempts: 3,
      categories: [],
      is_public: true,
      has_assessment: true,
      has_certificate: true,
      points_reward: 100
    });
    setActiveTab("details");
  };

  const addCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new training course to the platform
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter course description"
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalLessons">Total Lessons</Label>
                  <Input
                    id="totalLessons"
                    type="number"
                    min="1"
                    value={formData.total_lessons}
                    onChange={(e) => setFormData({ ...formData, total_lessons: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Cover Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Enter cover image URL"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add category"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                  />
                  <Button type="button" onClick={addCategory} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-20">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeCategory(category)}
                      >
                        {category}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Course</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this course available to all users
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Assessment</Label>
                    <p className="text-sm text-muted-foreground">
                      Add a final assessment to test knowledge
                    </p>
                  </div>
                  <Switch
                    checked={formData.has_assessment}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_assessment: checked })}
                  />
                </div>

                {formData.has_assessment && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.passing_score}
                        onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        min="1"
                        value={formData.max_attempts}
                        onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Issue Certificate</Label>
                    <p className="text-sm text-muted-foreground">
                      Award a certificate upon completion
                    </p>
                  </div>
                  <Switch
                    checked={formData.has_certificate}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_certificate: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsReward">Points Reward</Label>
                  <Input
                    id="pointsReward"
                    type="number"
                    min="0"
                    value={formData.points_reward}
                    onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Points awarded upon course completion
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <BookOpen className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-medium">Course Content</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.total_lessons} lessons
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-muted/50">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-medium">Duration</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.estimated_hours} hours
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-muted/50">
                    <Trophy className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-medium">Total Rewards</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.points_reward} points
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}