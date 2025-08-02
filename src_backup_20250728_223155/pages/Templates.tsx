import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Target, BookOpen, Briefcase, Users } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function Templates() {
 const [, setLocation] = useLocation();
 const [activeCategory, setActiveCategory] = useState("all");

 // Template data organized by category
 const templateCategories = {
   "business-strategy": {
     name: "Business Strategy",
     icon: Briefcase,
     color: "blue",
     templates: [
       {
         id: "startup-pitch",
         name: "Startup Pitch Generator",
         description: "Create compelling pitch presentations that capture investor attention and clearly communicate your business value proposition.",
         tags: ["Pitch Deck", "Investment", "Strategy"]
       },
       {
         id: "revenue-model",
         name: "Revenue Model Designer",
         description: "Design sustainable revenue streams and pricing strategies for your business with detailed financial projections.",
         tags: ["Revenue", "Pricing", "Financial"]
       },
       {
         id: "market-analysis",
         name: "Market Analysis Framework",
         description: "Conduct comprehensive market research and competitive analysis to identify opportunities and threats.",
         tags: ["Market Research", "Competition", "Analysis"]
       }
     ]
   },
   "marketing": {
     name: "Marketing",
     icon: Target,
     color: "green",
     templates: [
       {
         id: "social-campaign",
         name: "Social Media Campaign",
         description: "Launch engaging social media campaigns across multiple platforms with optimized content and scheduling strategies.",
         tags: ["Social Media", "Campaign", "Content"]
       },
       {
         id: "seo-strategy",
         name: "SEO Content Strategy",
         description: "Develop comprehensive SEO strategies with keyword research, content planning, and optimization techniques.",
         tags: ["SEO", "Content", "Keywords"]
       },
       {
         id: "brand-identity",
         name: "Brand Identity Builder",
         description: "Create consistent brand messaging, visual identity, and positioning strategies that resonate with your target audience.",
         tags: ["Branding", "Identity", "Messaging"]
       }
     ]
   },
   "education": {
     name: "Education",
     icon: BookOpen,
     color: "purple",
     templates: [
       {
         id: "course-creator",
         name: "Online Course Creator",
         description: "Design comprehensive online courses with structured modules, learning objectives, and assessment strategies.",
         tags: ["Course Design", "Learning", "Education"]
       },
       {
         id: "skill-development",
         name: "Skill Development Path",
         description: "Create personalized learning paths for skill development with milestones, resources, and progress tracking.",
         tags: ["Skills", "Development", "Learning Path"]
       },
       {
         id: "research-framework",
         name: "Research Framework",
         description: "Establish systematic research methodologies for academic and professional investigations with clear protocols.",
         tags: ["Research", "Methodology", "Academic"]
       }
     ]
   },
   "product-development": {
     name: "Product Development",
     icon: Sparkles,
     color: "orange",
     templates: [
       {
         id: "mvp-planner",
         name: "MVP Development Planner",
         description: "Plan and execute minimum viable product development with feature prioritization and user feedback integration.",
         tags: ["MVP", "Development", "Features"]
       },
       {
         id: "ux-design",
         name: "UX Design Strategy",
         description: "Create user-centered design strategies with personas, user journeys, and interface optimization techniques.",
         tags: ["UX Design", "User Experience", "Interface"]
       },
       {
         id: "product-roadmap",
         name: "Product Roadmap Template",
         description: "Develop strategic product roadmaps with timeline planning, feature releases, and stakeholder alignment.",
         tags: ["Roadmap", "Planning", "Strategy"]
       }
     ]
   },
   "personal-development": {
     name: "Personal Development",
     icon: Users,
     color: "pink",
     templates: [
       {
         id: "goal-setting",
         name: "SMART Goal Framework",
         description: "Set and achieve personal and professional goals using SMART criteria with actionable steps and tracking methods.",
         tags: ["Goals", "Planning", "Achievement"]
       },
       {
         id: "public-speaking",
         name: "Public Speaking Coach",
         description: "Develop confident public speaking skills with structured practice routines and presentation techniques.",
         tags: ["Speaking", "Presentation", "Communication"]
       },
       {
         id: "networking-strategy",
         name: "Professional Networking",
         description: "Build meaningful professional relationships with strategic networking approaches and relationship management.",
         tags: ["Networking", "Relationships", "Professional"]
       }
     ]
   }
 };

 const allTemplates = Object.values(templateCategories).flatMap(category => 
   category.templates.map(template => ({ ...template, category: category.name }))
 );

 const handleUseTemplate = (template: any) => {
   // Store template data in session storage and navigate to generation
   sessionStorage.setItem('questionnaire', JSON.stringify({
     category: template.category.toLowerCase().replace(' ', '-'),
     responses: {},
     templateId: template.id,
     isTemplate: true
   }));
   
   setLocation('/generation');
 };

 const scrollToCategory = (categoryId: string) => {
   const element = document.getElementById(categoryId);
   if (element) {
     element.scrollIntoView({ behavior: 'smooth' });
   }
   setActiveCategory(categoryId);
 };

 const getColorClasses = (color: string) => {
   const colorMap = {
     blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
     green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
     purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
     orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
     pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
   };
   return colorMap[color as keyof typeof colorMap] || colorMap.blue;
 };

 return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
     {/* Header Section */}
     <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <BackButton />
         
         <div className="text-center mt-8">
           <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
             Explore Templates
           </h1>
           <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
             Jump-start your projects with our professionally crafted templates. Choose from business strategy, marketing, education, product development, and personal growth categories.
           </p>
         </div>

         {/* Navigation Bar */}
         <div className="mt-8 flex flex-wrap justify-center gap-2">
           <Button
             variant={activeCategory === "all" ? "default" : "outline"}
             onClick={() => setActiveCategory("all")}
             className="mb-2"
           >
             All Templates
           </Button>
           {Object.entries(templateCategories).map(([key, category]) => {
             const Icon = category.icon;
             return (
               <Button
                 key={key}
                 variant={activeCategory === key ? "default" : "outline"}
                 onClick={() => scrollToCategory(key)}
                 className="mb-2 flex items-center space-x-2"
               >
                 <Icon className="w-4 h-4" />
                 <span>{category.name}</span>
               </Button>
             );
           })}
         </div>
       </div>
     </div>

     {/* Templates Content */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
       {/* Category Sections */}
       {Object.entries(templateCategories).map(([categoryKey, category]) => {
         const Icon = category.icon;
         
         return (
           <section 
             key={categoryKey} 
             id={categoryKey}
             className="mb-16"
           >
             {/* Category Header */}
             <div className="text-center mb-8">
               <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full border-2 ${getColorClasses(category.color)} mb-4`}>
                 <Icon className="w-6 h-6" />
                 <h2 className="text-2xl font-bold">{category.name}</h2>
               </div>
             </div>

             {/* Template Cards Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {category.templates.map((template) => (
                 <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200 dark:hover:border-indigo-700">
                   <CardHeader>
                     <CardTitle className="flex items-start justify-between">
                       <span className="text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                         {template.name}
                       </span>
                       <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                     </CardTitle>
                     <CardDescription className="text-sm leading-relaxed">
                       {template.description}
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="flex flex-wrap gap-2 mb-4">
                       {template.tags.map((tag, index) => (
                         <Badge key={index} variant="secondary" className="text-xs">
                           {tag}
                         </Badge>
                       ))}
                     </div>
                     <Button 
                       onClick={() => handleUseTemplate({ ...template, category: category.name })}
                       className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                     >
                       Use Template
                     </Button>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </section>
         );
       })}

       {/* Call to Action */}
       <div className="text-center mt-16 p-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
         <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
           Don't see what you're looking for?
         </h3>
         <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
           Create custom prompts using our intelligent questionnaire system. Answer a few questions and get AI-generated content tailored to your specific needs.
         </p>
         <Button 
           onClick={() => setLocation('/categories')}
           size="lg"
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
         >
           Create Custom Prompt
         </Button>
       </div>
     </div>
   </div>
 );
}