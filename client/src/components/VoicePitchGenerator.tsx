import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Mic, Play, Pause, Square, Download, Share2, Sparkles,
  Volume2, Loader2, RefreshCw, Clock, Zap, Copy, Check,
  ChevronDown, ChevronUp, Edit3, Wand2
} from 'lucide-react';

// Voice personas for pitch generation
const voicePersonas = [
  { id: 'nova', name: 'Victoria Sterling', persona: 'The CEO', emoji: '👩‍💼', vibe: 'Commanding & Persuasive', color: 'from-purple-500 to-indigo-500' },
  { id: 'alloy', name: 'Alex Dynamo', persona: 'The Hype Machine', emoji: '🔥', vibe: 'High-Energy & Exciting', color: 'from-red-500 to-pink-500' },
  { id: 'onyx', name: 'Marcus Vox', persona: 'The Movie Trailer Guy', emoji: '🎬', vibe: 'Epic & Cinematic', color: 'from-slate-600 to-gray-800' },
  { id: 'echo', name: 'Jake Summers', persona: 'The Best Friend', emoji: '☕', vibe: 'Warm & Relatable', color: 'from-amber-500 to-orange-500' },
  { id: 'fable', name: 'Sage Storyteller', persona: 'The Narrator', emoji: '📖', vibe: 'Rich & Compelling', color: 'from-emerald-500 to-green-600' },
  { id: 'shimmer', name: 'Luna Serene', persona: 'The Wellness Guide', emoji: '🧘', vibe: 'Calm & Trustworthy', color: 'from-teal-400 to-cyan-500' },
];

interface VoicePitchGeneratorProps {
  // Blueprint data
  appName?: string;
  appDescription?: string;
  industry?: string;
  features?: string[];
  targetAudience?: string;
  blueprint?: any;

  // Customization
  defaultDuration?: 30 | 60 | 90;
  defaultVoice?: string;

  // Callbacks
  onScriptGenerated?: (script: string) => void;
  onAudioGenerated?: (audioUrl: string) => void;

  // Display mode
  mode?: 'inline' | 'modal' | 'standalone';
  isOpen?: boolean;
  onClose?: () => void;
}

const VoicePitchGenerator: React.FC<VoicePitchGeneratorProps> = ({
  appName = 'Your App',
  appDescription,
  industry,
  features = [],
  targetAudience,
  blueprint,
  defaultDuration = 60,
  defaultVoice = 'nova',
  onScriptGenerated,
  onAudioGenerated,
  mode = 'inline',
  isOpen = false,
  onClose,
}) => {
  const { toast } = useToast();

  // State
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice);
  const [duration, setDuration] = useState<30 | 60 | 90>(defaultDuration);
  const [script, setScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 1.0, pitch: 1.0 });
  const [editingScript, setEditingScript] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get selected voice persona
  const selectedPersona = voicePersonas.find(v => v.id === selectedVoice) || voicePersonas[0];

  // Calculate estimated tokens
  const estimatedTokens = Math.ceil(script.length / 100) * 10;

  // Generate pitch script from blueprint
  const generateScript = useCallback(async () => {
    setIsGeneratingScript(true);

    try {
      const response = await fetch('/api/voice/generate-from-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          blueprint,
          appName,
          appDescription,
          industry,
          features,
          targetAudience,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setScript(data.script);
      onScriptGenerated?.(data.script);

      toast({
        title: 'Script Generated! 🎉',
        description: `${duration}-second pitch script ready. Review and customize it!`,
      });
    } catch (error) {
      console.error('Script generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate pitch script. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingScript(false);
    }
  }, [blueprint, appName, appDescription, industry, features, targetAudience, duration, onScriptGenerated, toast]);

  // Generate voice from script
  const generateVoice = useCallback(async () => {
    if (!script.trim()) {
      toast({
        title: 'No Script',
        description: 'Generate or write a script first!',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingAudio(true);

    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: script,
          voice: selectedVoice,
          style: selectedPersona.persona,
          settings: voiceSettings,
          category: 'apps',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate voice');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      onAudioGenerated?.(data.audioUrl);

      toast({
        title: 'Voice Generated! 🎙️',
        description: `${selectedPersona.name} brought your pitch to life! ${data.tokensUsed} tokens used.`,
      });
    } catch (error: any) {
      console.error('Voice generation error:', error);
      toast({
        title: 'Voice Generation Failed',
        description: error.message || 'Could not generate voice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [script, selectedVoice, selectedPersona, voiceSettings, onAudioGenerated, toast]);

  // Play/pause audio
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Download audio
  const downloadAudio = useCallback(() => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${appName.replace(/\s+/g, '-').toLowerCase()}-pitch.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Downloaded!', description: 'Your pitch audio has been downloaded.' });
  }, [audioUrl, appName, toast]);

  // Copy script
  const copyScript = useCallback(() => {
    navigator.clipboard.writeText(script);
    toast({ title: 'Copied!', description: 'Script copied to clipboard.' });
  }, [script, toast]);

  // Audio event handlers
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  // The main content
  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Generate Voice Pitch for "{appName}"
        </h3>
        <p className="text-gray-400 text-sm">
          Create a professional AI-voiced pitch in seconds
        </p>
      </div>

      {/* Duration Selection */}
      <div className="flex justify-center gap-3">
        {[30, 60, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d as 30 | 60 | 90)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              duration === d
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            {d}s
          </button>
        ))}
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <span className="text-lg">🎭</span> Choose Your Voice
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {voicePersonas.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`p-3 rounded-xl text-left transition-all ${
                selectedVoice === voice.id
                  ? `bg-gradient-to-r ${voice.color} text-white shadow-lg`
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
              }`}
            >
              <span className="text-xl">{voice.emoji}</span>
              <div className="font-medium text-sm mt-1">{voice.name}</div>
              <div className="text-[10px] opacity-75">{voice.vibe}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Script Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            📝 Pitch Script
          </label>
          <div className="flex gap-2">
            {script && (
              <>
                <Button variant="ghost" size="sm" onClick={copyScript} className="text-gray-400 hover:text-white h-8">
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingScript(!editingScript)}
                  className="text-gray-400 hover:text-white h-8"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {!script ? (
          <div className="p-8 bg-slate-800/50 rounded-xl border border-dashed border-slate-600 text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Click "Generate Script" to create your pitch</p>
            <Button
              onClick={generateScript}
              disabled={isGeneratingScript}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Your Pitch...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate {duration}s Script
                </>
              )}
            </Button>
          </div>
        ) : editingScript ? (
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="min-h-[200px] bg-slate-800/50 border-slate-600 text-white"
            placeholder="Edit your pitch script..."
          />
        ) : (
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600">
            <p className="text-gray-200 text-sm whitespace-pre-wrap">{script}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700 text-xs text-gray-500">
              <span>{script.length} chars • ~{Math.ceil(script.split(/\s+/).length / 150 * 60)}s</span>
              <span>{estimatedTokens} tokens to generate</span>
            </div>
          </div>
        )}

        {script && !editingScript && (
          <Button
            variant="outline"
            size="sm"
            onClick={generateScript}
            disabled={isGeneratingScript}
            className="w-full border-slate-600 text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingScript ? 'animate-spin' : ''}`} />
            Regenerate Script
          </Button>
        )}
      </div>

      {/* Advanced Settings */}
      {script && (
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Voice Settings
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-800/30 rounded-lg space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Speed</span>
                  <span className="text-white">{voiceSettings.rate.toFixed(2)}x</span>
                </div>
                <Slider
                  value={[voiceSettings.rate]}
                  onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, rate: value }))}
                  min={0.75}
                  max={1.25}
                  step={0.05}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Voice Button */}
      {script && (
        <Button
          onClick={generateVoice}
          disabled={isGeneratingAudio || !script.trim()}
          className="w-full py-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-lg"
        >
          {isGeneratingAudio ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {selectedPersona.name} is Recording...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Generate Voice with {selectedPersona.name}
              <Badge className="ml-2 bg-white/20">{estimatedTokens} tokens</Badge>
            </>
          )}
        </Button>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlayback}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 h-14 w-14 rounded-full p-0"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>

              <div className="flex-1">
                <div className="text-white font-medium">Your {duration}s Pitch is Ready!</div>
                <div className="text-sm text-gray-400">Voiced by {selectedPersona.name} ({selectedPersona.persona})</div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadAudio} className="border-cyan-500/50 text-cyan-300">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Waveform visualization placeholder */}
            <div className="mt-4 h-12 bg-slate-900/50 rounded-lg flex items-center justify-center overflow-hidden">
              {isPlaying ? (
                <div className="flex items-center gap-1">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 30}ms`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-50">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full"
                      style={{ height: `${(Math.sin(i * 0.5) + 1) * 15 + 5}px` }}
                    />
                  ))}
                </div>
              )}
            </div>

            <audio ref={audioRef} src={audioUrl} className="hidden" />
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render based on mode
  if (mode === 'modal') {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Voice Pitch Generator</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Inline or standalone mode
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        {content}
      </CardContent>
    </Card>
  );
};

export default VoicePitchGenerator;
