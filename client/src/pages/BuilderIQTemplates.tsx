import React, { useState, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import BuilderIQRating from '@/components/BuilderIQRating';
import AcademyLearningIndicator, { AcademyHelpButton } from '@/components/AcademyLearningIndicator';
import { useVoiceService } from '@/services/voiceService';
import {
  Search, Filter, Star, Users, Clock, ArrowRight, Copy, Check,
  Heart, TrendingUp, ShoppingCart, GraduationCap, Scale, Home,
  Gamepad2, Car, Plane, Dumbbell, UtensilsCrossed, Building2,
  Briefcase, Zap, Bot, CreditCard, Lock, Sparkles, Layout
} from 'lucide-react';

// Template data structure
interface Template {
  id: string;
  title: string;
  description: string;
  industry: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  rating: number;
  usageCount: number;
  features: string[];
  includesAI: boolean;
  includesPayments: boolean;
  includesAuth: boolean;
  prompt: string;
  estimatedTime: string;
  isFeatured: boolean;
}

// Industry icons mapping
const industryIcons: Record<string, React.ReactNode> = {
  healthcare: <Heart className="w-5 h-5" />,
  finance: <TrendingUp className="w-5 h-5" />,
  ecommerce: <ShoppingCart className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  legal: <Scale className="w-5 h-5" />,
  realestate: <Home className="w-5 h-5" />,
  entertainment: <Gamepad2 className="w-5 h-5" />,
  automotive: <Car className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  fitness: <Dumbbell className="w-5 h-5" />,
  restaurant: <UtensilsCrossed className="w-5 h-5" />,
  business: <Briefcase className="w-5 h-5" />,
};

// Industry colors
const industryColors: Record<string, string> = {
  healthcare: 'from-red-500 to-pink-500',
  finance: 'from-green-500 to-emerald-500',
  ecommerce: 'from-blue-500 to-cyan-500',
  education: 'from-purple-500 to-violet-500',
  legal: 'from-amber-500 to-orange-500',
  realestate: 'from-teal-500 to-cyan-500',
  entertainment: 'from-pink-500 to-rose-500',
  automotive: 'from-slate-500 to-gray-500',
  travel: 'from-sky-500 to-blue-500',
  fitness: 'from-orange-500 to-red-500',
  restaurant: 'from-yellow-500 to-amber-500',
  business: 'from-indigo-500 to-purple-500',
};

// Sample templates data
const templates: Template[] = [
  // Healthcare
  {
    id: 'telehealth-platform',
    title: 'Telehealth Platform',
    description: 'Complete virtual healthcare solution with video consultations, scheduling, patient records, and prescription management.',
    industry: 'healthcare',
    category: 'Platform',
    complexity: 'enterprise',
    rating: 4.9,
    usageCount: 1250,
    features: ['Video Calls', 'Scheduling', 'Medical Records', 'Prescriptions', 'Insurance'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '6-8 weeks',
    isFeatured: true,
    prompt: `Build a comprehensive telehealth platform with the following features:

CORE FEATURES:
- Patient registration and authentication
- Doctor/Provider profiles and availability
- Video consultation with WebRTC
- Appointment scheduling and calendar
- Electronic Medical Records (EMR)
- Prescription management
- Insurance verification
- Payment processing with Stripe

TECHNICAL REQUIREMENTS:
- HIPAA compliant architecture
- End-to-end encryption
- Real-time notifications
- Mobile responsive design

Build with React, Node.js, PostgreSQL, and WebRTC.`,
  },
  {
    id: 'patient-portal',
    title: 'Patient Portal',
    description: 'Self-service patient portal for viewing records, booking appointments, and communicating with healthcare providers.',
    industry: 'healthcare',
    category: 'Portal',
    complexity: 'medium',
    rating: 4.7,
    usageCount: 890,
    features: ['Medical Records', 'Appointments', 'Messaging', 'Billing'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '3-4 weeks',
    isFeatured: false,
    prompt: `Build a patient portal application...`,
  },

  // E-Commerce
  {
    id: 'multi-vendor-marketplace',
    title: 'Multi-Vendor Marketplace',
    description: 'Full-featured marketplace where multiple sellers can list products with order management, reviews, and commission handling.',
    industry: 'ecommerce',
    category: 'Marketplace',
    complexity: 'enterprise',
    rating: 4.8,
    usageCount: 2100,
    features: ['Multi-vendor', 'Cart', 'Payments', 'Reviews', 'Order Tracking'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '8-10 weeks',
    isFeatured: true,
    prompt: `Build a multi-vendor e-commerce marketplace...`,
  },
  {
    id: 'subscription-box',
    title: 'Subscription Box Platform',
    description: 'Subscription commerce platform for curated product boxes with recurring billing and customer management.',
    industry: 'ecommerce',
    category: 'Subscription',
    complexity: 'medium',
    rating: 4.6,
    usageCount: 650,
    features: ['Subscriptions', 'Box Customization', 'Recurring Billing', 'Inventory'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '4-5 weeks',
    isFeatured: false,
    prompt: `Build a subscription box commerce platform...`,
  },

  // Education
  {
    id: 'lms-platform',
    title: 'Learning Management System',
    description: 'Complete LMS with course creation, student enrollment, progress tracking, quizzes, and certificates.',
    industry: 'education',
    category: 'Platform',
    complexity: 'complex',
    rating: 4.7,
    usageCount: 1500,
    features: ['Courses', 'Quizzes', 'Certificates', 'Progress Tracking', 'Video Lessons'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '6-8 weeks',
    isFeatured: true,
    prompt: `Build a learning management system...`,
  },
  {
    id: 'tutoring-marketplace',
    title: 'Tutoring Marketplace',
    description: 'Platform connecting students with tutors, featuring scheduling, video sessions, and payment processing.',
    industry: 'education',
    category: 'Marketplace',
    complexity: 'medium',
    rating: 4.5,
    usageCount: 420,
    features: ['Tutor Profiles', 'Booking', 'Video Calls', 'Reviews', 'Payments'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '4-6 weeks',
    isFeatured: false,
    prompt: `Build a tutoring marketplace platform...`,
  },

  // Finance
  {
    id: 'budget-tracker',
    title: 'Personal Budget Tracker',
    description: 'Smart budgeting app with expense tracking, savings goals, bill reminders, and financial insights.',
    industry: 'finance',
    category: 'Tracker',
    complexity: 'medium',
    rating: 4.6,
    usageCount: 980,
    features: ['Expense Tracking', 'Budgets', 'Goals', 'Reports', 'Bank Sync'],
    includesAI: true,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '3-4 weeks',
    isFeatured: true,
    prompt: `Build a personal budget tracking application...`,
  },
  {
    id: 'invoice-system',
    title: 'Invoice & Billing System',
    description: 'Professional invoicing platform for freelancers and small businesses with payment tracking and client management.',
    industry: 'finance',
    category: 'Management',
    complexity: 'medium',
    rating: 4.7,
    usageCount: 750,
    features: ['Invoices', 'Client Management', 'Payment Tracking', 'Reports', 'PDF Export'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '3-4 weeks',
    isFeatured: false,
    prompt: `Build an invoicing and billing system...`,
  },

  // Fitness
  {
    id: 'workout-tracker',
    title: 'Workout Tracker App',
    description: 'Fitness app with workout logging, exercise library, progress charts, and achievement system.',
    industry: 'fitness',
    category: 'Tracker',
    complexity: 'medium',
    rating: 4.5,
    usageCount: 620,
    features: ['Workout Log', 'Exercise Library', 'Progress Charts', 'Achievements', 'Social'],
    includesAI: true,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '4-5 weeks',
    isFeatured: true,
    prompt: `Build a workout tracking fitness application...`,
  },

  // Restaurant
  {
    id: 'restaurant-ordering',
    title: 'Restaurant Ordering System',
    description: 'Online ordering platform with menu management, cart, payment processing, and order tracking.',
    industry: 'restaurant',
    category: 'Ordering',
    complexity: 'medium',
    rating: 4.6,
    usageCount: 540,
    features: ['Menu Builder', 'Online Ordering', 'Table Reservations', 'Payments', 'Kitchen Display'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '3-4 weeks',
    isFeatured: false,
    prompt: `Build a restaurant ordering system...`,
  },

  // Real Estate
  {
    id: 'property-listing',
    title: 'Property Listing Platform',
    description: 'Real estate platform with property listings, search filters, virtual tours, and agent management.',
    industry: 'realestate',
    category: 'Marketplace',
    complexity: 'complex',
    rating: 4.7,
    usageCount: 820,
    features: ['Listings', 'Search Filters', 'Map View', 'Virtual Tours', 'Agent Profiles'],
    includesAI: true,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '5-6 weeks',
    isFeatured: true,
    prompt: `Build a property listing real estate platform...`,
  },

  // Business
  {
    id: 'crm-system',
    title: 'CRM System',
    description: 'Customer relationship management with contact management, deals pipeline, tasks, and analytics.',
    industry: 'business',
    category: 'Management',
    complexity: 'complex',
    rating: 4.8,
    usageCount: 1100,
    features: ['Contacts', 'Deals Pipeline', 'Tasks', 'Email Integration', 'Analytics'],
    includesAI: true,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '5-7 weeks',
    isFeatured: true,
    prompt: `Build a CRM (Customer Relationship Management) system...`,
  },
  {
    id: 'project-management',
    title: 'Project Management Tool',
    description: 'Collaborative project management with kanban boards, tasks, time tracking, and team collaboration.',
    industry: 'business',
    category: 'Management',
    complexity: 'medium',
    rating: 4.6,
    usageCount: 950,
    features: ['Kanban Boards', 'Tasks', 'Time Tracking', 'Team Chat', 'File Sharing'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '4-5 weeks',
    isFeatured: false,
    prompt: `Build a project management tool...`,
  },

  // Restaurant & Food Service
  {
    id: 'restaurant-website',
    title: 'Restaurant Website',
    description: 'Beautiful restaurant website with menu display, online reservations, photo gallery, and location.',
    industry: 'restaurant',
    category: 'Website',
    complexity: 'simple',
    rating: 4.9,
    usageCount: 3200,
    features: ['Menu Display', 'Reservations', 'Photo Gallery', 'Contact Form', 'Location Map'],
    includesAI: false,
    includesPayments: false,
    includesAuth: false,
    estimatedTime: '1-2 weeks',
    isFeatured: true,
    prompt: `Build a modern restaurant website with:
- Beautiful hero section with food images
- Interactive menu with categories and prices
- Online reservation system with date/time picker
- Photo gallery of dishes and venue
- Contact form and Google Maps integration
- Mobile responsive design

Use React, Tailwind CSS, and a simple backend for reservations.`,
  },
  {
    id: 'food-delivery-app',
    title: 'Food Delivery App',
    description: 'DoorDash/UberEats-style food delivery platform with restaurant listings, cart, and real-time tracking.',
    industry: 'restaurant',
    category: 'Platform',
    complexity: 'enterprise',
    rating: 4.8,
    usageCount: 1800,
    features: ['Restaurant Listings', 'Cart', 'Payments', 'Live Tracking', 'Driver App'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '10-12 weeks',
    isFeatured: true,
    prompt: `Build a complete food delivery platform like DoorDash...`,
  },

  // Real Estate
  {
    id: 'property-listings',
    title: 'Property Listings Site',
    description: 'Zillow-style property listing website with search, filters, property details, and agent contact.',
    industry: 'realestate',
    category: 'Platform',
    complexity: 'complex',
    rating: 4.7,
    usageCount: 1500,
    features: ['Property Search', 'Advanced Filters', 'Map View', 'Agent Profiles', 'Favorites'],
    includesAI: true,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '6-8 weeks',
    isFeatured: true,
    prompt: `Build a property listing platform like Zillow with property search, map integration, and agent contacts.`,
  },
  {
    id: 'agent-portfolio',
    title: 'Real Estate Agent Portfolio',
    description: 'Professional portfolio website for real estate agents with listings, testimonials, and contact.',
    industry: 'realestate',
    category: 'Portfolio',
    complexity: 'simple',
    rating: 4.6,
    usageCount: 980,
    features: ['Agent Bio', 'Current Listings', 'Testimonials', 'Contact Form', 'Social Links'],
    includesAI: false,
    includesPayments: false,
    includesAuth: false,
    estimatedTime: '1-2 weeks',
    isFeatured: false,
    prompt: `Build a professional real estate agent portfolio website...`,
  },

  // Fitness & Wellness
  {
    id: 'gym-management',
    title: 'Gym Management System',
    description: 'Complete gym management with membership tracking, class schedules, trainer assignments, and payments.',
    industry: 'fitness',
    category: 'Management',
    complexity: 'complex',
    rating: 4.8,
    usageCount: 1200,
    features: ['Memberships', 'Class Scheduling', 'Trainer Management', 'Payments', 'Progress Tracking'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '6-8 weeks',
    isFeatured: true,
    prompt: `Build a gym management system with membership management, class scheduling, and trainer assignments.`,
  },
  {
    id: 'workout-tracker',
    title: 'Workout Tracker App',
    description: 'Personal fitness app to track workouts, set goals, monitor progress, and get AI workout suggestions.',
    industry: 'fitness',
    category: 'App',
    complexity: 'medium',
    rating: 4.7,
    usageCount: 2100,
    features: ['Workout Logging', 'Goal Setting', 'Progress Charts', 'AI Suggestions', 'Social Sharing'],
    includesAI: true,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '3-4 weeks',
    isFeatured: false,
    prompt: `Build a workout tracking app with exercise logging and AI-powered workout recommendations.`,
  },

  // Travel & Hospitality
  {
    id: 'hotel-booking',
    title: 'Hotel Booking Platform',
    description: 'Booking.com-style hotel reservation system with search, rooms, availability, and payments.',
    industry: 'travel',
    category: 'Platform',
    complexity: 'enterprise',
    rating: 4.8,
    usageCount: 890,
    features: ['Hotel Search', 'Room Types', 'Availability Calendar', 'Payments', 'Reviews'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '8-10 weeks',
    isFeatured: true,
    prompt: `Build a hotel booking platform with search, room availability, and reservation management.`,
  },
  {
    id: 'travel-blog',
    title: 'Travel Blog',
    description: 'Beautiful travel blog with destination guides, photo galleries, itineraries, and subscriber newsletter.',
    industry: 'travel',
    category: 'Blog',
    complexity: 'simple',
    rating: 4.5,
    usageCount: 1500,
    features: ['Blog Posts', 'Photo Gallery', 'Itineraries', 'Newsletter', 'Comments'],
    includesAI: false,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '2-3 weeks',
    isFeatured: false,
    prompt: `Build a travel blog with beautiful destination guides and photo galleries.`,
  },

  // Entertainment & Gaming
  {
    id: 'streaming-platform',
    title: 'Video Streaming Platform',
    description: 'Netflix-style video streaming service with content library, user profiles, and subscription tiers.',
    industry: 'entertainment',
    category: 'Platform',
    complexity: 'enterprise',
    rating: 4.9,
    usageCount: 750,
    features: ['Video Player', 'Content Library', 'User Profiles', 'Subscriptions', 'Recommendations'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '12-16 weeks',
    isFeatured: true,
    prompt: `Build a video streaming platform with content library and AI-powered recommendations.`,
  },
  {
    id: 'event-ticketing',
    title: 'Event Ticketing System',
    description: 'Eventbrite-style platform for event creation, ticket sales, RSVPs, and attendee management.',
    industry: 'entertainment',
    category: 'Platform',
    complexity: 'complex',
    rating: 4.7,
    usageCount: 1100,
    features: ['Event Creation', 'Ticket Sales', 'Seating Charts', 'Check-in', 'Analytics'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '5-6 weeks',
    isFeatured: false,
    prompt: `Build an event ticketing platform with ticket sales and attendee management.`,
  },

  // Portfolio & Creative
  {
    id: 'photographer-portfolio',
    title: 'Photography Portfolio',
    description: 'Stunning portfolio website for photographers with galleries, booking, and client proofing.',
    industry: 'business',
    category: 'Portfolio',
    complexity: 'medium',
    rating: 4.9,
    usageCount: 2500,
    features: ['Photo Galleries', 'Client Proofing', 'Booking Calendar', 'Contact Form', 'Pricing'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '2-3 weeks',
    isFeatured: true,
    prompt: `Build a photography portfolio with stunning galleries and client booking system.`,
  },
  {
    id: 'freelancer-portfolio',
    title: 'Freelancer Portfolio',
    description: 'Professional portfolio for designers, developers, and creatives with project showcases and testimonials.',
    industry: 'business',
    category: 'Portfolio',
    complexity: 'simple',
    rating: 4.8,
    usageCount: 3800,
    features: ['Project Showcase', 'Skills', 'Testimonials', 'Contact', 'Resume Download'],
    includesAI: false,
    includesPayments: false,
    includesAuth: false,
    estimatedTime: '1-2 weeks',
    isFeatured: true,
    prompt: `Build a modern freelancer portfolio with project showcases and contact form.`,
  },

  // AI & Automation
  {
    id: 'ai-chatbot',
    title: 'AI Customer Support Chatbot',
    description: 'Intelligent chatbot for customer support with natural language processing and ticket creation.',
    industry: 'business',
    category: 'AI Tool',
    complexity: 'complex',
    rating: 4.9,
    usageCount: 1400,
    features: ['NLP', 'FAQ Answers', 'Ticket Creation', 'Live Handoff', 'Analytics'],
    includesAI: true,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '4-6 weeks',
    isFeatured: true,
    prompt: `Build an AI-powered customer support chatbot with natural language processing and ticket escalation.`,
  },
  {
    id: 'social-media-scheduler',
    title: 'Social Media Scheduler',
    description: 'Buffer-style tool to schedule social media posts across platforms with analytics and AI content suggestions.',
    industry: 'business',
    category: 'Tool',
    complexity: 'medium',
    rating: 4.7,
    usageCount: 1900,
    features: ['Multi-Platform', 'Scheduling', 'Analytics', 'AI Content', 'Team Collaboration'],
    includesAI: true,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '4-5 weeks',
    isFeatured: false,
    prompt: `Build a social media scheduling tool with multi-platform support and AI content suggestions.`,
  },

  // SaaS Landing Pages
  {
    id: 'saas-landing',
    title: 'SaaS Landing Page',
    description: 'High-converting SaaS landing page with pricing tables, features, testimonials, and email capture.',
    industry: 'business',
    category: 'Landing Page',
    complexity: 'simple',
    rating: 4.9,
    usageCount: 5200,
    features: ['Hero Section', 'Features Grid', 'Pricing Tables', 'Testimonials', 'CTA Forms'],
    includesAI: false,
    includesPayments: false,
    includesAuth: false,
    estimatedTime: '1 week',
    isFeatured: true,
    prompt: `Build a high-converting SaaS landing page with modern design, pricing tables, and email capture.`,
  },
  {
    id: 'startup-website',
    title: 'Startup Website',
    description: 'Complete startup website with team page, about, blog, careers, and investor section.',
    industry: 'business',
    category: 'Website',
    complexity: 'medium',
    rating: 4.6,
    usageCount: 2800,
    features: ['About Page', 'Team', 'Blog', 'Careers', 'Press Kit'],
    includesAI: false,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '2-3 weeks',
    isFeatured: false,
    prompt: `Build a complete startup website with team page, blog, and careers section.`,
  },

  // Non-Profit
  {
    id: 'charity-donation',
    title: 'Charity Donation Platform',
    description: 'Non-profit donation platform with campaigns, recurring donations, donor management, and impact tracking.',
    industry: 'business',
    category: 'Platform',
    complexity: 'medium',
    rating: 4.8,
    usageCount: 680,
    features: ['Campaigns', 'Recurring Donations', 'Donor Portal', 'Impact Reports', 'Tax Receipts'],
    includesAI: false,
    includesPayments: true,
    includesAuth: true,
    estimatedTime: '4-5 weeks',
    isFeatured: false,
    prompt: `Build a charity donation platform with campaign management and recurring donations.`,
  },

  // Automotive
  {
    id: 'car-dealership',
    title: 'Car Dealership Website',
    description: 'Auto dealership website with vehicle inventory, search filters, financing calculator, and appointment booking.',
    industry: 'automotive',
    category: 'Website',
    complexity: 'medium',
    rating: 4.7,
    usageCount: 920,
    features: ['Vehicle Inventory', 'Search Filters', 'Financing Calculator', 'Appointments', 'Trade-In'],
    includesAI: false,
    includesPayments: false,
    includesAuth: true,
    estimatedTime: '3-4 weeks',
    isFeatured: false,
    prompt: `Build a car dealership website with vehicle inventory and financing calculator.`,
  },
];

const BuilderIQTemplates: React.FC = () => {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/builderiq/templates/:industry');
  const { toast } = useToast();
  const voiceService = useVoiceService('enthusiastic');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(params?.industry || 'all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get unique industries
  const industries = useMemo(() => {
    const unique = [...new Set(templates.map(t => t.industry))];
    return unique.sort();
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
      const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;

      return matchesSearch && matchesIndustry && matchesComplexity;
    });
  }, [searchQuery, selectedIndustry, selectedComplexity]);

  // Featured templates
  const featuredTemplates = useMemo(() => {
    return templates.filter(t => t.isFeatured).slice(0, 4);
  }, []);

  // Copy template prompt
  const handleCopyPrompt = async (template: Template) => {
    await navigator.clipboard.writeText(template.prompt);
    setCopiedId(template.id);
    toast({
      title: 'Copied!',
      description: `${template.title} prompt copied to clipboard`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Use template (navigate to questionnaire with template context)
  const handleUseTemplate = (template: Template) => {
    localStorage.setItem('builderiq_template', JSON.stringify(template));
    navigate(`/builderiq/questionnaire?template=${template.id}`);
  };

  const complexityColors: Record<string, string> = {
    simple: 'bg-green-500/20 text-green-300 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    complex: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    enterprise: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <BackButton />

          <div className="mt-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">Template Library</h1>
              </div>
              <p className="text-gray-400">100+ ready-to-use app blueprints across 12 industries</p>
            </div>
            <AcademyHelpButton topic="templates" />
          </div>
        </div>

        {/* Academy Learning Banner */}
        <div className="mb-8">
          <AcademyLearningIndicator
            topic="templates"
            description="Learn how to use templates effectively"
            variant="banner"
            showDismiss={true}
          />
        </div>

        {/* Featured Templates */}
        {selectedIndustry === 'all' && !searchQuery && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Featured Templates
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-gradient-to-br from-purple-900/50 to-slate-800/50 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer group"
                  onClick={() => handleUseTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${industryColors[template.industry]} flex items-center justify-center mb-3`}>
                      {industryIcons[template.industry]}
                    </div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className={complexityColors[template.complexity]}>
                        {template.complexity}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {template.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind} className="capitalize">{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="Complexity" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Complexity</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${industryColors[template.industry]} flex items-center justify-center text-white`}>
                    {industryIcons[template.industry]}
                  </div>
                  <Badge className={complexityColors[template.complexity]}>
                    {template.complexity}
                  </Badge>
                </div>
                <CardTitle className="text-white mt-3 group-hover:text-purple-300 transition-colors">
                  {template.title}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.features.slice(0, 4).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs border-slate-600 text-gray-400">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 4 && (
                    <Badge variant="outline" className="text-xs border-slate-600 text-gray-500">
                      +{template.features.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Badges for capabilities */}
                <div className="flex gap-2 mb-4">
                  {template.includesAI && (
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                      <Bot className="w-3 h-3 mr-1" /> AI
                    </Badge>
                  )}
                  {template.includesPayments && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                      <CreditCard className="w-3 h-3 mr-1" /> Payments
                    </Badge>
                  )}
                  {template.includesAuth && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                      <Lock className="w-3 h-3 mr-1" /> Auth
                    </Badge>
                  )}
                </div>

                {/* Stats with Interactive Rating */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <BuilderIQRating
                    initialRating={template.rating}
                    totalRatings={template.usageCount}
                    itemId={template.id}
                    itemType="template"
                    size="sm"
                    showCount={false}
                    interactive={true}
                    onRate={(rating) => {
                      voiceService.speak(`Thanks for rating ${template.title} ${rating} stars!`, { personality: 'friendly' });
                    }}
                  />
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {template.usageCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.estimatedTime}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopyPrompt(template)}
                    className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600"
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No templates found matching your criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('all');
                setSelectedComplexity('all');
              }}
              className="border-slate-700 text-gray-300"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Can't find what you're looking for?</p>
          <Button
            onClick={() => navigate('/builderiq/questionnaire')}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create Custom Blueprint
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuilderIQTemplates;
