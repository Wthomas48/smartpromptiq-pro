import { useState } from "react";
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import TutorialVideoPlayer from "@/components/TutorialVideoPlayer";
import TutorialVideoGallery from "@/components/TutorialVideoGallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  BookOpen,
  Star,
  Clock,
  Users,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Zap,
  ChevronRight,
  CheckCircle,
  PlayCircle
} from "lucide-react";

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  views: number;
  likes: number;
  instructor: string;
  topics: string[];
  transcript?: string;
  featured?: boolean;
  new?: boolean;
}

export default function Tutorials() {
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);

  const handleVideoSelect = (video: TutorialVideo) => {
    setSelectedVideo(video);
  };

  const handleVideoComplete = () => {
    if (selectedVideo && !completedVideos.includes(selectedVideo.id)) {
      setCompletedVideos([...completedVideos, selectedVideo.id]);
    }
  };

  const learningPaths = [
    {
      id: 'beginner',
      title: 'Getting Started',
      description: 'Perfect for newcomers to AI prompting and SmartPromptIQ Pro',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-green-100 text-green-800',
      videoCount: 6,
      duration: '45 mins',
      level: 'Beginner'
    },
    {
      id: 'intermediate',
      title: 'Advanced Techniques',
      description: 'Level up your prompting skills with advanced strategies',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-800',
      videoCount: 8,
      duration: '1.2 hours',
      level: 'Intermediate'
    },
    {
      id: 'expert',
      title: 'Expert Mastery',
      description: 'Master-level techniques for professional use',
      icon: <Award className="w-6 h-6" />,
      color: 'bg-red-100 text-red-800',
      videoCount: 5,
      duration: '55 mins',
      level: 'Advanced'
    },
    {
      id: 'specialization',
      title: 'Industry Specialization',
      description: 'Specialized techniques for specific industries',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-800',
      videoCount: 12,
      duration: '2 hours',
      level: 'All Levels'
    }
  ];

  const featuredVideos = [
    {
      id: '1',
      title: 'Getting Started with SmartPromptIQ Pro',
      description: 'Learn the basics of using SmartPromptIQ Pro to create amazing prompts for AI models.',
      thumbnail: '/api/placeholder/400/225',
      videoUrl: '/videos/getting-started.mp4',
      duration: '5:23',
      category: 'Getting Started',
      difficulty: 'Beginner' as const,
      views: 2543,
      likes: 198,
      instructor: 'Sarah Johnson',
      topics: ['Basics', 'Interface', 'First Prompts'],
      featured: true,
      new: true
    },
    {
      id: '2',
      title: 'Advanced Prompt Engineering Techniques',
      description: 'Master advanced techniques for creating highly effective AI prompts that get better results.',
      thumbnail: '/api/placeholder/400/225',
      videoUrl: '/videos/advanced-techniques.mp4',
      duration: '12:45',
      category: 'Advanced',
      difficulty: 'Advanced' as const,
      views: 1832,
      likes: 156,
      instructor: 'Dr. Michael Chen',
      topics: ['Advanced Techniques', 'Optimization', 'Best Practices'],
      featured: true
    },
    {
      id: '3',
      title: 'Marketing Campaign Prompts',
      description: 'Create compelling marketing content using AI-powered prompt templates.',
      thumbnail: '/api/placeholder/400/225',
      videoUrl: '/videos/marketing-prompts.mp4',
      duration: '8:17',
      category: 'Marketing',
      difficulty: 'Intermediate' as const,
      views: 3421,
      likes: 287,
      instructor: 'Emma Rodriguez',
      topics: ['Marketing', 'Content Creation', 'Campaigns'],
      featured: true
    }
  ];

  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <BackButton />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedVideo(null)}
              className="mb-4"
            >
              ← Back to Tutorials
            </Button>
          </div>

          <TutorialVideoPlayer
            video={selectedVideo}
            showTranscript={true}
            onComplete={handleVideoComplete}
          />

          {/* Related Videos */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Related Tutorials</h3>
            <TutorialVideoGallery
              videos={featuredVideos.filter(v => v.id !== selectedVideo.id)}
              onVideoSelect={handleVideoSelect}
              showCategories={false}
              showSearch={false}
              showFilters={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Navigation />
      <BackButton />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Master AI Prompting with Video Tutorials
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Learn from experts, follow structured learning paths, and become a prompting pro with our comprehensive video tutorials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse All Tutorials
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Tabs defaultValue="featured" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="all">All Tutorials</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-8">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <PlayCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">45+</div>
                  <div className="text-sm text-gray-600">Video Tutorials</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">8.5hrs</div>
                  <div className="text-sm text-gray-600">Total Content</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">12K+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Videos */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Tutorials</h2>
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <TutorialVideoGallery
                videos={featuredVideos}
                onVideoSelect={handleVideoSelect}
                featured={true}
                showCategories={false}
                showFilters={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Choose Your Learning Path</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow structured learning paths designed to take you from beginner to expert in AI prompting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <Card key={path.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${path.color}`}>
                        {path.icon}
                      </div>
                      <Badge variant="outline">{path.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                        {path.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{path.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>{path.videoCount} videos</span>
                        <span>{path.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">Progress:</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '0%'}}></div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => {/* Navigate to learning path */}}>
                      Start Learning Path
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <TutorialVideoGallery
              videos={featuredVideos}
              onVideoSelect={handleVideoSelect}
              showCategories={true}
              showSearch={true}
              showFilters={true}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Learning Progress</h2>
              <p className="text-gray-600">Track your progress and continue where you left off.</p>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{completedVideos.length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Play className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold">2.5hrs</div>
                  <div className="text-sm text-gray-600">Total Watched</div>
                </CardContent>
              </Card>
            </div>

            {/* Continue Watching */}
            <div>
              <h3 className="text-xl font-bold mb-4">Continue Watching</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredVideos.slice(0, 2).map((video) => (
                  <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="relative w-32 h-18 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-2">{video.title}</h4>
                          <div className="text-xs text-gray-500 mb-2">
                            Progress: 65% • 3:45 remaining
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div className="bg-blue-600 h-1 rounded-full" style={{width: '65%'}}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}