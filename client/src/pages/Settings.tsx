import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useElevenLabsVoiceSafe } from "@/contexts/ElevenLabsVoiceContext";
import { ELEVENLABS_VOICES, VOICE_PRESETS, ELEVENLABS_VOICE_IDS } from "@/config/voices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getApiBaseUrl, apiRequest } from "@/config/api";
import {
  User,
  Mail,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Trash2,
  Save,
  Settings as SettingsIcon,
  Volume2,
  Play,
  Check,
  Mic,
  Pause,
  Loader2,
  Square,
  Accessibility,
  ArrowRight,
  Link2,
  Unlink,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const voiceContext = useElevenLabsVoiceSafe();
  const { toast } = useToast();
  
  // Form states
  const [profile, setProfile] = useState({
    firstName: (user as any)?.firstName || "",
    lastName: (user as any)?.lastName || "",
    email: user?.email || "",
    bio: (user as any)?.bio || "",
    company: (user as any)?.company || "",
    title: (user as any)?.title || ""
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    promptUpdates: true,
    weeklyDigest: false,
    marketingEmails: false
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC",
    defaultCategory: "general"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Discord connection state
  const [discordStatus, setDiscordStatus] = useState<{
    connected: boolean;
    discordUsername: string | null;
    oauthConfigured: boolean;
    inviteUrl: string;
  }>({ connected: false, discordUsername: null, oauthConfigured: false, inviteUrl: 'https://discord.gg/smartpromptiq' });
  const [discordLoading, setDiscordLoading] = useState(false);

  useEffect(() => {
    const fetchDiscordStatus = async () => {
      try {
        const res = await apiRequest('GET', '/api/discord/status');
        const data = await res.json();
        if (data.success) {
          setDiscordStatus({
            connected: data.connected,
            discordUsername: data.discordUsername,
            oauthConfigured: data.oauthConfigured,
            inviteUrl: data.inviteUrl || 'https://discord.gg/smartpromptiq',
          });
        }
      } catch {
        // Non-critical
      }
    };
    fetchDiscordStatus();
  }, []);

  const handleDiscordConnect = () => {
    const baseUrl = getApiBaseUrl();
    window.location.href = `${baseUrl}/api/discord/connect`;
  };

  const handleDiscordDisconnect = async () => {
    setDiscordLoading(true);
    try {
      const res = await apiRequest('POST', '/api/discord/disconnect');
      const data = await res.json();
      if (data.success) {
        setDiscordStatus(prev => ({ ...prev, connected: false, discordUsername: null }));
        toast({ title: 'Discord Disconnected', description: 'Your Discord account has been unlinked.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to disconnect Discord.', variant: 'destructive' });
    } finally {
      setDiscordLoading(false);
    }
  };

  // Test sample phrases for each voice
  const getTestPhrase = (voiceName: string) => {
    const phrases: Record<string, string> = {
      rachel: "Hello! I'm Rachel. I have a calm and professional voice perfect for business content.",
      drew: "Hey there! I'm Drew, bringing you energetic narration for your most exciting projects.",
      clyde: "Greetings! I'm Clyde. My warm and friendly voice is great for storytelling.",
      paul: "Hi! I'm Paul. My clear and articulate voice works well for educational content.",
      domi: "Hello! I'm Domi. I bring a sophisticated European touch to your narrations.",
      dave: "What's up! I'm Dave. My conversational style is perfect for podcasts and videos.",
      fin: "Hey! I'm Fin. My young, energetic voice is great for modern content.",
      sarah: "Hi there! I'm Sarah. I have a warm, friendly voice ideal for wellness content.",
      antoni: "Hello! I'm Antoni. My deep, authoritative voice commands attention.",
      thomas: "Greetings! I'm Thomas. My British accent adds elegance to any narration.",
      charlie: "Hi! I'm Charlie. My natural, friendly tone is perfect for casual content.",
      george: "Hello! I'm George. My distinguished voice brings gravitas to your projects.",
      emily: "Hi! I'm Emily. My bright, expressive voice is great for engaging content.",
      elli: "Hello! I'm Elli. My youthful voice is perfect for dynamic narrations.",
      callum: "Hey! I'm Callum. My Scottish accent adds character to your content.",
      patrick: "Hello! I'm Patrick. My warm baritone voice is ideal for storytelling.",
      harry: "Hi there! I'm Harry. My British voice brings sophistication to narrations.",
      liam: "Hello! I'm Liam. My professional voice works great for business content.",
      dorothy: "Hi! I'm Dorothy. My warm, motherly voice is perfect for gentle narrations.",
      josh: "Hey! I'm Josh. My friendly voice is great for YouTube and social content.",
      arnold: "Greetings! I'm Arnold. My powerful voice is perfect for impactful content.",
      charlotte: "Hello! I'm Charlotte. My elegant voice adds class to your narrations.",
      matilda: "Hi! I'm Matilda. My gentle voice is ideal for calming content.",
      matthew: "Hello! I'm Matthew. My clear voice is perfect for professional narrations.",
      james: "Hi there! I'm James. My authoritative voice works well for documentaries.",
      joseph: "Hello! I'm Joseph. My versatile voice adapts to any content style.",
      default: "Hello! This is a test of the selected voice. How does it sound?"
    };
    return phrases[voiceName.toLowerCase()] || phrases.default;
  };

  // Test voice using ElevenLabs API
  const handleTestVoice = async (voiceId: string, voiceName: string) => {
    if (testingVoice === voiceId && isTestPlaying) {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsTestPlaying(false);
      setTestingVoice(null);
      return;
    }

    setTestingVoice(voiceId);
    setIsTestPlaying(false);

    try {
      const testPhrase = getTestPhrase(voiceName);

      // Use the voice context if available
      if (voiceContext?.speak) {
        await voiceContext.speak(testPhrase, {
          voice: voiceId,
          onComplete: () => {
            setIsTestPlaying(false);
            setTestingVoice(null);
          },
          onError: (error) => {
            toast({
              title: "Voice Test Failed",
              description: error || "Could not generate voice sample",
              variant: "destructive"
            });
            setIsTestPlaying(false);
            setTestingVoice(null);
          }
        });
        setIsTestPlaying(true);
        toast({
          title: "Testing Voice",
          description: `Playing sample with ${voiceName}'s voice`,
        });
      } else {
        // Fallback: Use browser's Web Speech API for demo
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(testPhrase);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.onend = () => {
            setIsTestPlaying(false);
            setTestingVoice(null);
          };
          utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            // Gracefully handle interrupted/canceled errors
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Settings voice test error:', e.error);
            }
            setIsTestPlaying(false);
            setTestingVoice(null);
          };
          window.speechSynthesis.speak(utterance);
          setIsTestPlaying(true);
          toast({
            title: "Demo Preview",
            description: `Browser voice preview (real ElevenLabs requires API)`,
          });
        } else {
          toast({
            title: "Voice Preview Unavailable",
            description: "Your browser doesn't support voice synthesis",
            variant: "destructive"
          });
          setTestingVoice(null);
        }
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not play voice sample",
        variant: "destructive"
      });
      setIsTestPlaying(false);
      setTestingVoice(null);
    }
  };

  // Stop all voice playback
  const stopAllVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (voiceContext?.stop) {
      voiceContext.stop();
    }
    setIsTestPlaying(false);
    setTestingVoice(null);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="container mx-auto px-4 pt-20 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    placeholder="Product Manager"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Theme & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance & Preferences</span>
              </CardTitle>
              <CardDescription>
                Customize your app experience and interface preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-toggle">Dark Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === "dark"}
                  onCheckedChange={() => toggleTheme()}
                />
              </div>

              <Separator />

              {/* Accessibility Settings Link */}
              <Link href="/accessibility">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl border border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <Accessibility className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Accessibility Settings</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Configure screen reader, voice narration, reduced motion & more
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    placeholder="English"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    placeholder="UTC"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="defaultCategory">Default Category</Label>
                <Input
                  id="defaultCategory"
                  value={preferences.defaultCategory}
                  onChange={(e) => setPreferences({...preferences, defaultCategory: e.target.value})}
                  placeholder="General"
                />
              </div>

              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Connected Accounts - Discord */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link2 className="w-5 h-5" />
                <span>Connected Accounts</span>
              </CardTitle>
              <CardDescription>
                Link external accounts to enhance your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Discord */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#5865F2] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Discord</h4>
                    {discordStatus.connected ? (
                      <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected as <span className="font-medium">{discordStatus.discordUsername}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Link your Discord for community access & roles
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {discordStatus.connected ? (
                    <>
                      <a
                        href={discordStatus.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDiscordDisconnect}
                        disabled={discordLoading}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {discordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                        <span className="ml-1">Disconnect</span>
                      </Button>
                    </>
                  ) : discordStatus.oauthConfigured ? (
                    <Button
                      onClick={handleDiscordConnect}
                      className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                      size="sm"
                    >
                      <Link2 className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  ) : (
                    <a
                      href={discordStatus.inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Join Server
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings - ElevenLabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Voice Settings (ElevenLabs)</span>
              </CardTitle>
              <CardDescription>
                Configure AI voice narration for lessons, prompts, and app previews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Enable Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-enabled">Enable Voice Narration</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Turn on AI voice narration across the app
                  </p>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={voiceContext?.isVoiceEnabled ?? true}
                  onCheckedChange={(checked) => voiceContext?.setVoiceEnabled(checked)}
                />
              </div>

              <Separator />

              {/* Auto Narrate Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-narrate">Auto-Narrate Content</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically read content when entering pages
                  </p>
                </div>
                <Switch
                  id="auto-narrate"
                  checked={voiceContext?.autoNarrate ?? false}
                  onCheckedChange={(checked) => voiceContext?.setAutoNarrate(checked)}
                />
              </div>

              <Separator />

              {/* Voice Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center space-x-2">
                    <Mic className="w-4 h-4" />
                    <span>Select Voice</span>
                    <Badge variant="secondary" className="ml-2">
                      {ELEVENLABS_VOICES.length} voices
                    </Badge>
                  </Label>
                  {isTestPlaying && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopAllVoice}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ELEVENLABS_VOICES.map((voice) => {
                    const isSelected = voiceContext?.selectedVoice === voice.id;
                    const isTesting = testingVoice === voice.id;
                    return (
                      <div
                        key={voice.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={() => voiceContext?.setSelectedVoice(voice.id)}
                            className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left flex-1"
                          >
                            {voice.name}
                          </button>
                          <div className="flex items-center gap-1">
                            {/* Play/Test Button */}
                            <button
                              onClick={() => handleTestVoice(voice.id, voice.name)}
                              disabled={testingVoice !== null && testingVoice !== voice.id}
                              className={`p-1.5 rounded-full transition-all ${
                                isTesting && isTestPlaying
                                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                  : isTesting
                                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-600'
                              } ${testingVoice !== null && testingVoice !== voice.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isTesting && isTestPlaying ? 'Stop' : 'Test this voice'}
                            >
                              {isTesting && !isTestPlaying ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isTesting && isTestPlaying ? (
                                <Square className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            {/* Selected Check */}
                            {isSelected && (
                              <Check className="w-5 h-5 text-indigo-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {voice.gender}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {voice.style}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {voice.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Voice Preset Selection */}
              <div>
                <Label className="flex items-center space-x-2 mb-3">
                  <Play className="w-4 h-4" />
                  <span>Voice Style Preset</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries(VOICE_PRESETS).map(([presetName, settings]) => {
                    const isSelected = voiceContext?.selectedPreset === presetName;
                    const presetDescriptions: Record<string, string> = {
                      natural: 'Balanced & versatile',
                      clear: 'High clarity for education',
                      expressive: 'More emotion & variation',
                      dramatic: 'Maximum expression',
                      calm: 'Stable & soothing',
                    };
                    return (
                      <button
                        key={presetName}
                        onClick={() => voiceContext?.setSelectedPreset(presetName)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white capitalize block">
                          {presetName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {presetDescriptions[presetName] || 'Voice preset'}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-500 mx-auto mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Test Voice Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Test Your Voice Configuration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: <span className="font-medium text-indigo-600 dark:text-indigo-400">{voiceContext?.selectedVoice || 'rachel'}</span> with <span className="font-medium text-purple-600 dark:text-purple-400">{voiceContext?.selectedPreset || 'natural'}</span> preset
                    </p>
                  </div>
                  {voiceContext?.narrationState?.isPlaying && (
                    <Badge variant="secondary" className="animate-pulse">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Playing...
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const selectedVoiceName = ELEVENLABS_VOICES.find(v => v.id === voiceContext?.selectedVoice)?.name || 'Rachel';
                      handleTestVoice(voiceContext?.selectedVoice || 'rachel', selectedVoiceName);
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={testingVoice !== null}
                  >
                    {testingVoice && isTestPlaying ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop Playing
                      </>
                    ) : testingVoice ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Test Selected Voice
                      </>
                    )}
                  </Button>
                  {(isTestPlaying || voiceContext?.narrationState?.isPlaying) && (
                    <Button
                      onClick={stopAllVoice}
                      variant="outline"
                      className="text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive important updates and notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prompt-updates">Prompt Updates</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when new prompt templates are available
                  </p>
                </div>
                <Switch
                  id="prompt-updates"
                  checked={notifications.promptUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, promptUpdates: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive a weekly summary of your activity and new features
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) => setNotifications({...notifications, weeklyDigest: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive promotional emails about new features and offers
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={isLoading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Notification Preferences"}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>

              <Separator />

              <Alert>
                <AlertDescription>
                  Two-factor authentication adds an extra layer of security to your account. 
                  We recommend enabling it to protect your prompts and data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Once you delete your account, there is no going back. Please be certain.
                </AlertDescription>
              </Alert>
              <Button variant="destructive" className="w-full mt-4">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}