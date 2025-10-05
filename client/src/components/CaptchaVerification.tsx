import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { useSecurityContext } from './SecurityProvider';

interface CaptchaVerificationProps {
  onVerified: (verified: boolean) => void;
  required?: boolean;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  onVerified,
  required = true
}) => {
  const { generateCaptcha, verifyCaptcha, isVerified } = useSecurityContext();
  const [challenge, setChallenge] = useState<{question: string, answer: number} | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Generate simple math challenge
  const generateMathChallenge = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, answer, question;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
        question = `5 + 3 = ?`;
    }

    setChallenge({ question, answer });
  };

  const handleVerify = async () => {
    if (!challenge) return;

    setIsLoading(true);
    setError('');

    try {
      const isCorrect = parseInt(userAnswer) === challenge.answer;

      if (isCorrect) {
        const verified = await verifyCaptcha(userAnswer);
        onVerified(verified);
        if (!verified) {
          setError('Verification failed. Please try again.');
          setAttempts(prev => prev + 1);
          generateNewChallenge();
        }
      } else {
        setAttempts(prev => prev + 1);
        setError(`Incorrect answer. ${maxAttempts - attempts - 1} attempts remaining.`);

        if (attempts + 1 >= maxAttempts) {
          setError('Too many failed attempts. Please refresh and try again.');
          onVerified(false);
        } else {
          generateNewChallenge();
        }
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewChallenge = () => {
    generateMathChallenge();
    setUserAnswer('');
    generateCaptcha();
  };

  useEffect(() => {
    generateNewChallenge();
  }, []);

  if (isVerified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Security verification completed</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attempts >= maxAttempts) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Too many failed attempts. Please refresh the page.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Security Verification</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-700 mb-4">
          Please solve this simple math problem to verify you're human:
        </div>

        {challenge && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-mono bg-white p-4 rounded border border-blue-200">
                {challenge.question}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha-answer">Your Answer:</Label>
              <Input
                id="captcha-answer"
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                className="text-center text-lg"
                placeholder="Enter your answer"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleVerify}
                disabled={!userAnswer.trim() || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>

              <Button
                variant="outline"
                onClick={generateNewChallenge}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New</span>
              </Button>
            </div>

            <div className="text-xs text-blue-600 text-center">
              Attempt {attempts + 1} of {maxAttempts}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};