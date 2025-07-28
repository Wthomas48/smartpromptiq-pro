import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionOption {
  value: string;
  label: string;
  description: string;
}

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  description: string;
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  title,
  description,
  options,
  value,
  onChange
}: QuestionCardProps) {
  return (
    <Card className="bg-white shadow-xl">
      <CardContent className="p-8">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-4">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">{title}</h3>
          <p className="text-slate-600 text-lg">{description}</p>
        </div>
        
        <div className="space-y-4">
          {options.map((option) => (
            <label 
              key={option.value} 
              className="flex items-start space-x-4 p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer"
              onClick={() => onChange(option.value)}
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name={`question-${questionNumber}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-4 h-4 text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-1">{option.label}</div>
                <div className="text-slate-600 text-sm">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
