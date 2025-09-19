import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function VerifyEmail() {
  const [, params] = useRoute('/verify-email/:token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (params?.token) {
      verifyEmail(params.token);
    }
  }, [params?.token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Email verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Your account is now fully activated.'}
            {status === 'error' && 'There was a problem verifying your email.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className={status === 'success' ? 'border-green-200 bg-green-50' : status === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
            <Mail className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {status === 'success' && (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/signin">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Sign In
                </Link>
              </Button>
              <p className="text-sm text-gray-600 text-center">
                You can now sign in to your SmartPromptIQ account and start creating amazing AI prompts!
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button variant="outline" asChild className="w-full">
                <Link href="/signin">Back to Sign In</Link>
              </Button>
              <p className="text-sm text-gray-600 text-center">
                The verification link may have expired. Try signing in and request a new verification email.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}