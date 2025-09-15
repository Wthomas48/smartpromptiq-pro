import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Clock,
  User,
  Eye,
  ThumbsUp,
  Search,
  Filter,
  BookOpen,
  Zap,
  Target,
  Lightbulb,
  Settings,
  Star,
  TrendingUp
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

interface TutorialVideoGalleryProps {
  videos: TutorialVideo[];
  onVideoSelect: (video: TutorialVideo) => void;
  showCategories?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  featured?: boolean;
}

const mockVideos: TutorialVideo[] = [
  {
    id: '1',
    title: 'Getting Started with SmartPromptIQ Pro',
    description: 'Learn the basics of using SmartPromptIQ Pro to create amazing prompts for AI models.',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: '/videos/getting-started.mp4',
    duration: '5:23',
    category: 'Getting Started',
    difficulty: 'Beginner',
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
    difficulty: 'Advanced',
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
    difficulty: 'Intermediate',
    views: 3421,
    likes: 287,
    instructor: 'Emma Rodriguez',
    topics: ['Marketing', 'Content Creation', 'Campaigns']
  },
  {
    id: '4',
    title: 'Educational Content Generation',
    description: 'Use AI prompts to create educational materials, lesson plans, and learning content.',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: '/videos/education-prompts.mp4',
    duration: '10:30',
    category: 'Education',
    difficulty: 'Intermediate',
    views: 1976,
    likes: 142,
    instructor: 'Prof. David Kim',
    topics: ['Education', 'Learning', 'Curriculum']
  },
  {
    id: '5',
    title: 'Prompt Analytics and Optimization',
    description: 'Learn how to analyze prompt performance and optimize for better results.',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: '/videos/analytics.mp4',
    duration: '7:55',
    category: 'Analytics',
    difficulty: 'Advanced',
    views: 1234,
    likes: 89,
    instructor: 'Alex Thompson',
    topics: ['Analytics', 'Optimization', 'Performance']
  },
  {
    id: '6',
    title: 'Team Collaboration Features',
    description: 'Discover how to collaborate with your team using SmartPromptIQ Pro\'s sharing features.',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: '/videos/collaboration.mp4',
    duration: '6:42',
    category: 'Collaboration',
    difficulty: 'Beginner',
    views: 987,
    likes: 76,
    instructor: 'Lisa Park',
    topics: ['Teams', 'Sharing', 'Collaboration']
  }
];

export default function TutorialVideoGallery({
  videos = mockVideos,
  onVideoSelect,
  showCategories = true,
  showSearch = true,
  showFilters = true,
  featured = false
}: TutorialVideoGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredVideos = videos.filter(video => {
    if (featured && !video.featured) return false;

    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || video.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.new ? 1 : -1;
      case 'duration':
        return parseInt(a.duration) - parseInt(b.duration);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'popular':
      default:
        return b.views - a.views;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Getting Started': return <BookOpen className="w-4 h-4" />;
      case 'Advanced': return <Zap className="w-4 h-4" />;
      case 'Marketing': return <Target className="w-4 h-4" />;
      case 'Education': return <Lightbulb className="w-4 h-4" />;
      case 'Analytics': return <TrendingUp className="w-4 h-4" />;
      case 'Collaboration': return <User className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {showSearch && (
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Categories Tabs */}
      {showCategories && !featured && (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    onClick={() => onVideoSelect(video)}
                  >
                    <Play className="w-6 h-6 text-white ml-1" />
                  </Button>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>

                {/* New/Featured Badges */}
                <div className="absolute top-2 left-2 space-x-1">
                  {video.new && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">New</Badge>
                  )}
                  {video.featured && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Category Icon */}
                <div className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded">
                  {getCategoryIcon(video.category)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {video.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{video.instructor}</span>
                </div>
                <Badge className={getDifficultyColor(video.difficulty)} variant="outline">
                  {video.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{video.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{video.likes}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {video.category}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {video.topics.slice(0, 3).map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                    {topic}
                  </Badge>
                ))}
                {video.topics.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    +{video.topics.length - 3}
                  </Badge>
                )}
              </div>

              <Button
                onClick={() => onVideoSelect(video)}
                className="w-full mt-3"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Tutorial
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tutorials found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}