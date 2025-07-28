import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Target, FileText } from "lucide-react";

interface PromptCustomizerProps {
  customization: {
    tone: string;
    detailLevel: string;
    format: string;
  };
  onChange: (customization: any) => void;
}

const toneOptions = [
  { value: "professional", label: "Professional", color: "bg-blue-100 text-blue-800" },
  { value: "casual", label: "Casual", color: "bg-green-100 text-green-800" },
  { value: "authoritative", label: "Authoritative", color: "bg-purple-100 text-purple-800" },
  { value: "friendly", label: "Friendly", color: "bg-orange-100 text-orange-800" },
  { value: "analytical", label: "Analytical", color: "bg-indigo-100 text-indigo-800" }
];

const detailOptions = [
  { value: "brief", label: "Brief Overview", description: "Quick summary with key points" },
  { value: "standard", label: "Standard Detail", description: "Balanced depth and brevity" },
  { value: "comprehensive", label: "Comprehensive", description: "In-depth analysis with examples" },
  { value: "expert", label: "Expert Level", description: "Technical depth for specialists" }
];

const formatOptions = [
  { value: "structured", label: "Structured List", icon: FileText },
  { value: "narrative", label: "Narrative Flow", icon: Target },
  { value: "actionable", label: "Action Items", icon: Zap }
];

export default function PromptCustomizer({ customization, onChange }: PromptCustomizerProps) {
  const updateCustomization = (key: string, value: string) => {
    onChange({ ...customization, [key]: value });
  };

  return (
    <Card className="prompt-customizer">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings size={20} />
          <span>Customize Your Prompt</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-3 block">
            Communication Tone
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateCustomization("tone", option.value)}
                className="p-3 rounded-lg border transition-all border-slate-200 hover:border-slate-300"
              >
                <Badge className={option.color} variant="secondary">
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-3 block">
            Detail Level
          </label>
          <Select
            value={customization.detailLevel}
            onValueChange={(value) => updateCustomization("detailLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select detail level" />
            </SelectTrigger>
            <SelectContent>
              {detailOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-slate-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-3 block">
            Output Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateCustomization("format", option.value)}
                className="p-4 rounded-lg border transition-all text-left border-slate-200 hover:border-slate-300"
              >
                <div className="flex items-center space-x-3">
                  <option.icon size={20} className="text-slate-600" />
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border">
          <div className="text-sm font-medium text-slate-700 mb-2">Preview Settings</div>
          <div className="text-sm text-slate-600">
            Your prompt will be generated with a{" "}
            <span className="font-medium text-indigo-600">{customization.tone}</span> tone,{" "}
            <span className="font-medium text-indigo-600">
              {detailOptions.find(d => d.value === customization.detailLevel)?.label.toLowerCase()}
            </span>{" "}
            level of detail, in a{" "}
            <span className="font-medium text-indigo-600">
              {formatOptions.find(f => f.value === customization.format)?.label.toLowerCase()}
            </span>{" "}
            format.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
