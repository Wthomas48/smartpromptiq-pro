import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Accessibility,
  Eye,
  Volume2,
  Keyboard,
  Monitor,
  Moon,
  Sun,
  Type,
  Contrast,
  MousePointer,
  Zap,
  Check,
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Info
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

// Accessibility preferences interface
interface AccessibilityPreferences {
  // Visual
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  fontSize: number;

  // Audio
  voiceEnabled: boolean;
  autoNarrate: boolean;
  voiceSpeed: number;
  voiceVolume: number;

  // Navigation
  keyboardNavigation: boolean;
  focusIndicators: boolean;

  // Display
  theme: 'light' | 'dark' | 'system';
}

const defaultPreferences: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  fontSize: 100,
  voiceEnabled: true,
  autoNarrate: false,
  voiceSpeed: 1,
  voiceVolume: 80,
  keyboardNavigation: true,
  focusIndicators: true,
  theme: 'system'
};

export default function AccessibilitySettings() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const saved = localStorage.getItem('accessibilityPreferences');
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  });
  const [saved, setSaved] = useState(false);

  // Apply preferences on change
  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${preferences.fontSize}%`;

    // Apply reduced motion class
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply high contrast class
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply large text class
    if (preferences.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    // Save to localStorage
    localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('accessibilityPreferences');
    document.documentElement.style.fontSize = '100%';
    document.documentElement.classList.remove('reduce-motion', 'high-contrast', 'large-text');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        'Hello! Voice narration is working. This is how content will be read aloud.'
      );
      utterance.rate = preferences.voiceSpeed;
      utterance.volume = preferences.voiceVolume / 100;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white">
                <Accessibility className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Accessibility Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Customize your experience for better accessibility
                </p>
              </div>
            </div>

            {saved && (
              <Badge className="bg-green-500 text-white animate-pulse">
                <Check className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Keyboard Navigation Tip
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Press <kbd className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-mono">Tab</kbd> to navigate between elements.
                  The skip link appears when you press Tab at the top of any page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-purple-600" />
                <div>
                  <CardTitle>Visual Settings</CardTitle>
                  <CardDescription>Adjust visual elements for better visibility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Color Theme</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose your preferred color scheme
                  </p>
                </div>
                <Select
                  value={theme || 'system'}
                  onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Reduced Motion
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Minimize animations and motion effects
                  </p>
                </div>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                  aria-label="Toggle reduced motion"
                />
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Contrast className="w-4 h-4" />
                    High Contrast
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                  aria-label="Toggle high contrast"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Text Size
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Adjust the base text size: {preferences.fontSize}%
                    </p>
                  </div>
                  <Badge variant="outline">{preferences.fontSize}%</Badge>
                </div>
                <Slider
                  value={[preferences.fontSize]}
                  onValueChange={([value]) => updatePreference('fontSize', value)}
                  min={75}
                  max={150}
                  step={5}
                  className="w-full"
                  aria-label="Adjust text size"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Smaller (75%)</span>
                  <span>Default (100%)</span>
                  <span>Larger (150%)</span>
                </div>
              </div>

              {/* Large Text Preset */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Large Text Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quick preset for larger, easier-to-read text
                  </p>
                </div>
                <Switch
                  checked={preferences.largeText}
                  onCheckedChange={(checked) => {
                    updatePreference('largeText', checked);
                    if (checked) updatePreference('fontSize', 125);
                  }}
                  aria-label="Toggle large text mode"
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice & Audio Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <div>
                  <CardTitle>Voice & Audio</CardTitle>
                  <CardDescription>Configure text-to-speech and audio narration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Enabled */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Enable Voice Narration</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow content to be read aloud using text-to-speech
                  </p>
                </div>
                <Switch
                  checked={preferences.voiceEnabled}
                  onCheckedChange={(checked) => updatePreference('voiceEnabled', checked)}
                  aria-label="Toggle voice narration"
                />
              </div>

              {/* Auto Narrate */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Auto-Narrate Content</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically read content when pages load
                  </p>
                </div>
                <Switch
                  checked={preferences.autoNarrate}
                  onCheckedChange={(checked) => updatePreference('autoNarrate', checked)}
                  disabled={!preferences.voiceEnabled}
                  aria-label="Toggle auto-narrate"
                />
              </div>

              {/* Voice Speed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Voice Speed</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Adjust how fast content is read: {preferences.voiceSpeed}x
                    </p>
                  </div>
                  <Badge variant="outline">{preferences.voiceSpeed}x</Badge>
                </div>
                <Slider
                  value={[preferences.voiceSpeed]}
                  onValueChange={([value]) => updatePreference('voiceSpeed', value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  disabled={!preferences.voiceEnabled}
                  className="w-full"
                  aria-label="Adjust voice speed"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Slower (0.5x)</span>
                  <span>Normal (1x)</span>
                  <span>Faster (2x)</span>
                </div>
              </div>

              {/* Voice Volume */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Voice Volume</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Adjust narration volume: {preferences.voiceVolume}%
                    </p>
                  </div>
                  <Badge variant="outline">{preferences.voiceVolume}%</Badge>
                </div>
                <Slider
                  value={[preferences.voiceVolume]}
                  onValueChange={([value]) => updatePreference('voiceVolume', value)}
                  min={0}
                  max={100}
                  step={5}
                  disabled={!preferences.voiceEnabled}
                  className="w-full"
                  aria-label="Adjust voice volume"
                />
              </div>

              {/* Test Voice Button */}
              <Button
                onClick={testVoice}
                disabled={!preferences.voiceEnabled}
                className="w-full"
                variant="outline"
              >
                <Play className="w-4 h-4 mr-2" />
                Test Voice Narration
              </Button>
            </CardContent>
          </Card>

          {/* Keyboard Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5 text-purple-600" />
                <div>
                  <CardTitle>Keyboard & Navigation</CardTitle>
                  <CardDescription>Configure keyboard navigation preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Focus Indicators */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <MousePointer className="w-4 h-4" />
                    Enhanced Focus Indicators
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show larger, more visible focus outlines for keyboard navigation
                  </p>
                </div>
                <Switch
                  checked={preferences.focusIndicators}
                  onCheckedChange={(checked) => updatePreference('focusIndicators', checked)}
                  aria-label="Toggle enhanced focus indicators"
                />
              </div>

              {/* Keyboard Shortcuts Info */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">Tab</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Navigate forward</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">Shift + Tab</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Navigate back</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">Enter</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Activate button</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">Space</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Toggle checkbox</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">Esc</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Close dialog</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs">Arrow Keys</kbd>
                    <span className="text-gray-600 dark:text-gray-400">Navigate menus</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screen Reader Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <CardTitle>Screen Reader Support</CardTitle>
                  <CardDescription>Information about screen reader compatibility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  SmartPromptIQ is designed to work with popular screen readers:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['NVDA', 'JAWS', 'VoiceOver', 'Narrator'].map((reader) => (
                    <div
                      key={reader}
                      className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-center"
                    >
                      <Check className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">{reader}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                    ARIA Support
                  </h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Semantic HTML landmarks (header, main, footer)</li>
                    <li>• ARIA labels on interactive elements</li>
                    <li>• Live regions for dynamic content updates</li>
                    <li>• Skip link for quick navigation to main content</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Link href="/settings">
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Back to All Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Accessibility Statement */}
        <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Our Accessibility Commitment
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            <p>
              SmartPromptIQ is committed to providing an accessible experience for all users.
              We strive to meet WCAG 2.1 Level AA standards and continuously improve our platform's accessibility.
            </p>
            <p className="mt-3">
              Our key accessibility features include:
            </p>
            <ul className="mt-2 space-y-1">
              <li>25+ AI voices for text-to-speech narration via ElevenLabs</li>
              <li>Browser-native speech synthesis fallback</li>
              <li>Full keyboard navigation support</li>
              <li>Screen reader compatible interface</li>
              <li>Dark mode and high contrast options</li>
              <li>Adjustable text size and reduced motion settings</li>
            </ul>
            <p className="mt-3">
              If you encounter any accessibility barriers or have suggestions for improvement,
              please contact us at <a href="mailto:accessibility@smartpromptiq.com" className="text-purple-600 dark:text-purple-400 hover:underline">accessibility@smartpromptiq.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
