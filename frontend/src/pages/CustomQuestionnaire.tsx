import { useState } from 'react';
import { Upload, FileText, Wand2, Download, Trash2, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import BackButton from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  lastModified: number;
}

interface QuestionnaireStep {
  id: string;
  title: string;
  description: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file';
    options?: string[];
    required?: boolean;
    placeholder?: string;
  }[];
}

export default function CustomQuestionnaire() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const questionnaireSteps: QuestionnaireStep[] = [
    {
      id: 'basic_info',
      title: 'Project Information',
      description: 'Tell us about your project and goals',
      fields: [
        {
          id: 'project_title',
          label: 'Project Title',
          type: 'text',
          required: true,
          placeholder: 'Enter your project name'
        },
        {
          id: 'project_type',
          label: 'Project Type',
          type: 'select',
          required: true,
          options: ['Business Strategy', 'Marketing Campaign', 'Product Development', 'Content Creation', 'Educational Course', 'Personal Development', 'Research Project', 'Creative Writing', 'Technical Documentation']
        },
        {
          id: 'target_audience',
          label: 'Target Audience',
          type: 'text',
          placeholder: 'Who is this for? (e.g., small business owners, students, professionals)'
        },
        {
          id: 'project_goals',
          label: 'Project Goals',
          type: 'textarea',
          placeholder: 'What do you want to achieve with this project?'
        }
      ]
    },
    {
      id: 'file_upload',
      title: 'File Upload & Context',
      description: 'Upload files that will help create your custom prompt',
      fields: [
        {
          id: 'file_upload',
          label: 'Upload Supporting Files',
          type: 'file',
          placeholder: 'Upload documents, images, or other files (PDF, DOC, TXT, CSV, etc.)'
        },
        {
          id: 'file_context',
          label: 'File Context',
          type: 'textarea',
          placeholder: 'Describe how these files relate to your project and what information they contain'
        },
        {
          id: 'data_format',
          label: 'Preferred Output Format',
          type: 'select',
          options: ['Detailed Report', 'Step-by-Step Guide', 'Bullet Points', 'Executive Summary', 'Action Plan', 'Creative Brief', 'Technical Specification', 'Presentation Outline']
        }
      ]
    },
    {
      id: 'requirements',
      title: 'Specific Requirements',
      description: 'Define your specific needs and constraints',
      fields: [
        {
          id: 'tone',
          label: 'Tone & Style',
          type: 'select',
          options: ['Professional', 'Casual', 'Technical', 'Creative', 'Academic', 'Persuasive', 'Informative', 'Conversational']
        },
        {
          id: 'complexity',
          label: 'Complexity Level',
          type: 'select',
          options: ['Beginner-Friendly', 'Intermediate', 'Advanced', 'Expert Level']
        },
        {
          id: 'length',
          label: 'Expected Length',
          type: 'select',
          options: ['Brief (1-2 pages)', 'Medium (3-5 pages)', 'Detailed (6-10 pages)', 'Comprehensive (10+ pages)']
        },
        {
          id: 'key_focus',
          label: 'Key Focus Areas',
          type: 'textarea',
          placeholder: 'What specific aspects should the prompt focus on?'
        },
        {
          id: 'constraints',
          label: 'Constraints or Limitations',
          type: 'textarea',
          placeholder: 'Any budget, time, or resource constraints to consider?'
        }
      ]
    },
    {
      id: 'customization',
      title: 'Advanced Customization',
      description: 'Fine-tune your prompt generation',
      fields: [
        {
          id: 'include_examples',
          label: 'Include Examples',
          type: 'checkbox'
        },
        {
          id: 'include_templates',
          label: 'Include Templates',
          type: 'checkbox'
        },
        {
          id: 'include_checklist',
          label: 'Include Action Checklist',
          type: 'checkbox'
        },
        {
          id: 'include_metrics',
          label: 'Include Success Metrics',
          type: 'checkbox'
        },
        {
          id: 'special_instructions',
          label: 'Special Instructions',
          type: 'textarea',
          placeholder: 'Any specific requirements or preferences for the prompt generation?'
        }
      ]
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        let content = '';
        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
          content = await file.text();
        }

        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          content,
          lastModified: file.lastModified
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        toast({
          title: "File uploaded",
          description: `${file.name} uploaded successfully`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File removed",
      description: "File removed from upload list",
    });
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < questionnaireSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateCustomPrompt = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare the data for prompt generation
      const promptData = {
        formData,
        uploadedFiles: uploadedFiles.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          content: f.content
        })),
        timestamp: new Date().toISOString()
      };

      // Call the API to generate custom prompt
      const response = await fetch('/api/generate-custom-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const result = await response.json();
      setGeneratedPrompt(result.prompt);
      
      toast({
        title: "Prompt Generated",
        description: "Your custom prompt has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate custom prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentStepData = questionnaireSteps[currentStep];
  const isLastStep = currentStep === questionnaireSteps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackButton />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Custom Prompt Builder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Take our guided questionnaire to create a prompt tailored to your specific needs
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {questionnaireSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {index + 1}
                </div>
                {index < questionnaireSteps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${index < currentStep 
                      ? 'bg-indigo-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {questionnaireSteps.length}: {currentStepData.title}
            </p>
          </div>
        </div>

        {/* Current Step Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStepData.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === 'text' && (
                  <Input
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    rows={4}
                  />
                )}
                
                {field.type === 'select' && (
                  <Select 
                    value={formData[field.id] || ''} 
                    onValueChange={(value) => handleFieldChange(field.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === 'checkbox' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={formData[field.id] || false}
                      onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                    />
                    <Label htmlFor={field.id} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                )}
                
                {field.type === 'file' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                              Upload files or drag and drop
                            </span>
                            <span className="mt-1 block text-xs text-gray-500">
                              PDF, DOC, TXT, CSV up to 10MB each
                            </span>
                          </Label>
                          <Input
                            id="file-upload"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt,.csv,.md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Uploaded Files ({uploadedFiles.length})
                        </h4>
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.content && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => alert(`Preview: ${file.content?.substring(0, 200)}...`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-4">
            {!isLastStep ? (
              <Button onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={generateCustomPrompt}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Custom Prompt
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Generated Prompt Display */}
        {generatedPrompt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="mr-2 h-5 w-5" />
                Your Custom Prompt
              </CardTitle>
              <CardDescription>
                Here's your tailored prompt based on your requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                  {generatedPrompt}
                </pre>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                >
                  Copy Prompt
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}