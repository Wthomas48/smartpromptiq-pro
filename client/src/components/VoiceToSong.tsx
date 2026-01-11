import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Mic, MicOff, Music, Play, Pause, Square, Download,
  Sparkles, Wand2, RefreshCw, Volume2, Clock, Zap,
  FileText, Loader2, Heart, Star, Flame, Radio,
  Guitar, Piano, Drum, Headphones, Upload, X,
  ChevronRight, Check, Copy, Share2, Brain, Cpu,
  AudioWaveform, Music2, Music4, Disc3, Waves,
  ListMusic, Trash2
} from 'lucide-react';

// ==========================================
// SONG STYLES / GENRES
// ==========================================

const songStyles = [
  { id: 'pop', name: 'Pop', icon: Star, color: 'from-pink-500 to-rose-500', description: 'Catchy, mainstream appeal' },
  { id: 'rock', name: 'Rock', icon: Guitar, color: 'from-red-500 to-orange-500', description: 'Guitar-driven energy' },
  { id: 'hiphop', name: 'Hip-Hop', icon: Flame, color: 'from-amber-500 to-yellow-500', description: 'Beats and flow' },
  { id: 'rnb', name: 'R&B/Soul', icon: Heart, color: 'from-purple-500 to-pink-500', description: 'Smooth and soulful' },
  { id: 'electronic', name: 'Electronic', icon: Cpu, color: 'from-cyan-500 to-blue-500', description: 'Synth-driven beats' },
  { id: 'country', name: 'Country', icon: Radio, color: 'from-amber-600 to-yellow-600', description: 'Acoustic storytelling' },
  { id: 'jazz', name: 'Jazz', icon: Piano, color: 'from-indigo-500 to-purple-500', description: 'Sophisticated vibes' },
  { id: 'reggae', name: 'Reggae', icon: Waves, color: 'from-green-500 to-emerald-500', description: 'Island rhythms' },
];

const moodOptions = [
  { id: 'happy', name: 'Happy & Upbeat', emoji: '😊' },
  { id: 'sad', name: 'Sad & Emotional', emoji: '😢' },
  { id: 'energetic', name: 'Energetic & Hype', emoji: '🔥' },
  { id: 'chill', name: 'Chill & Relaxed', emoji: '😌' },
  { id: 'romantic', name: 'Romantic & Loving', emoji: '💕' },
  { id: 'angry', name: 'Angry & Intense', emoji: '😤' },
  { id: 'nostalgic', name: 'Nostalgic & Dreamy', emoji: '🌙' },
  { id: 'motivational', name: 'Motivational', emoji: '💪' },
];

const vocalStyles = [
  { id: 'male', name: 'Male Vocal', description: 'Deep, rich male voice' },
  { id: 'female', name: 'Female Vocal', description: 'Clear, melodic female voice' },
  { id: 'duet', name: 'Duet', description: 'Male & female harmony' },
  { id: 'choir', name: 'Choir/Group', description: 'Multiple voices' },
  { id: 'rap', name: 'Rap/Spoken', description: 'Rhythmic spoken word' },
];

// ==========================================
// LYRICS TEMPLATES
// ==========================================

const lyricsTemplates = [
  {
    id: 'love-song',
    name: 'Love Song',
    category: 'romantic',
    template: `[Verse 1]
Every time I see your face
My heart beats in a different pace
You light up my darkest days
In so many ways

[Chorus]
You're the one I've been dreaming of
The missing piece, my only love
Together we can rise above
You're the one I've been dreaming of

[Verse 2]
(Add your own lyrics here...)

[Bridge]
(Add emotional bridge...)

[Chorus]
(Repeat chorus)`,
  },
  {
    id: 'motivational',
    name: 'Motivational Anthem',
    category: 'uplifting',
    template: `[Verse 1]
When the world tries to bring you down
Stand up tall, don't lose your crown
Every step you take is a victory
Writing your own history

[Chorus]
Rise up, shine bright
We're gonna make it through the night
Nothing's gonna stop us now
We'll show them how

[Verse 2]
(Add your journey story...)

[Bridge]
(Build to the climax...)

[Final Chorus]
(Powerful ending)`,
  },
  {
    id: 'party',
    name: 'Party Track',
    category: 'fun',
    template: `[Intro]
Let's go! Yeah!

[Verse 1]
Friday night, we're feeling right
Gonna dance until the morning light
Hands up high, touch the sky
Tonight we're gonna fly

[Chorus]
Party all night long
Turn it up, sing this song
Everybody move your feet
Feel the rhythm, feel the beat

[Drop]
(Instrumental break)

[Verse 2]
(Keep the energy high...)`,
  },
  {
    id: 'storytelling',
    name: 'Story Song',
    category: 'narrative',
    template: `[Verse 1]
In a small town by the river side
Where dreams are big and hearts are wide
There lived a [character] with a dream
Things aren't always what they seem

[Chorus]
This is the story of [theme]
[Message you want to convey]
Every word I sing is true
This one's dedicated to you

[Verse 2]
(Continue the story...)

[Bridge]
(Turning point in the story...)

[Final Chorus]
(Resolution)`,
  },
];

// ==========================================
// VOICE RECORDER FOR HUMMING/SINGING
// ==========================================

const VoiceMelodyRecorder: React.FC<{
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
}> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const monitorLevel = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationRef.current = requestAnimationFrame(monitorLevel);
      };
      monitorLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob, recordingTime);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Record Your Melody</h3>
        <p className="text-gray-400 text-sm">Hum, whistle, or sing your tune - AI will turn it into music!</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Recording Button */}
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          size="lg"
          className={`h-20 w-20 rounded-full transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-lg shadow-purple-500/30'
          }`}
        >
          {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </Button>

        {isRecording ? (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-medium">Recording your melody...</span>
            </div>
            <div className="text-4xl font-bold text-white font-mono">{formatTime(recordingTime)}</div>

            {/* Animated Waveform */}
            <div className="flex items-center justify-center gap-1 h-16">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{
                    height: `${Math.max(8, audioLevel * 60 * (0.5 + Math.sin(i * 0.5 + Date.now() / 200) * 0.5))}px`,
                  }}
                />
              ))}
            </div>

            <p className="text-gray-400 text-sm">Hum your melody or sing a few bars...</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400">Tap to start recording</p>
            <p className="text-gray-500 text-xs mt-1">Record 10-60 seconds of your melody idea</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// AI SONG GENERATION PROGRESS
// ==========================================

const SongGenerationProgress: React.FC<{ progress: number; stage: string }> = ({ progress, stage }) => {
  const stages = [
    { name: 'Analyzing', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    { name: 'Composing', icon: Music, color: 'from-purple-500 to-pink-500' },
    { name: 'Arranging', icon: Piano, color: 'from-orange-500 to-red-500' },
    { name: 'Vocals', icon: Mic, color: 'from-pink-500 to-rose-500' },
    { name: 'Mastering', icon: Sparkles, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent animate-pulse" />

      <div className="relative flex flex-col items-center">
        {/* Animated Music Icon */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-spin-slow flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse">
                <Music2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Musical Notes Animation */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float-up"
              style={{
                left: `${30 + i * 20}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              {['🎵', '🎶', '🎼'][i]}
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">Creating Your Song</h3>
        <p className="text-gray-400 mb-6">{stage}</p>

        {/* Progress Stages */}
        <div className="flex items-center gap-3 mb-6">
          {stages.map((s, i) => (
            <div key={s.name} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                progress > i * 20
                  ? `bg-gradient-to-r ${s.color} scale-110`
                  : 'bg-slate-700 scale-100'
              }`}>
                <s.icon className={`w-5 h-5 ${progress > i * 20 ? 'text-white' : 'text-gray-500'}`} />
              </div>
              {i < stages.length - 1 && (
                <div className={`w-6 h-1 mx-1 rounded transition-all duration-500 ${
                  progress > (i + 1) * 20 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </div>
        </div>
        <p className="text-gray-500 mt-2">{Math.round(progress)}% Complete</p>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }

        @keyframes float-up {
          0%, 100% { transform: translateY(0) rotate(0); opacity: 0; }
          50% { transform: translateY(-50px) rotate(15deg); opacity: 1; }
        }
        .animate-float-up { animation: float-up 3s ease-in-out infinite; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};

// ==========================================
// DEMO AUDIO GENERATION HELPERS
// ==========================================

// Genre-specific audio parameters for demo mode
const GENRE_AUDIO_PARAMS: Record<string, { baseFreq: number; bpm: number; waveType: OscillatorType }> = {
  pop: { baseFreq: 440, bpm: 120, waveType: 'sine' },
  rock: { baseFreq: 330, bpm: 140, waveType: 'sawtooth' },
  hiphop: { baseFreq: 220, bpm: 90, waveType: 'square' },
  rnb: { baseFreq: 392, bpm: 85, waveType: 'sine' },
  electronic: { baseFreq: 523, bpm: 128, waveType: 'sawtooth' },
  country: { baseFreq: 349, bpm: 110, waveType: 'triangle' },
  jazz: { baseFreq: 466, bpm: 100, waveType: 'sine' },
  reggae: { baseFreq: 294, bpm: 75, waveType: 'triangle' },
};

// Generate demo audio using Web Audio API
async function generateDemoAudio(genre: string, durationSecs: number): Promise<string | null> {
  try {
    const params = GENRE_AUDIO_PARAMS[genre] || GENRE_AUDIO_PARAMS.pop;
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * Math.min(durationSecs, 30)); // Cap at 30s for demo

    // Create offline audio context
    const offlineCtx = new OfflineAudioContext(2, numSamples, sampleRate);

    // Create oscillator for melody
    const osc = offlineCtx.createOscillator();
    osc.type = params.waveType;
    osc.frequency.value = params.baseFreq;

    // Add some frequency variation for interest
    const beatInterval = 60 / params.bpm;
    for (let i = 0; i < durationSecs; i += beatInterval) {
      const noteOffset = [0, 4, 7, 12, 7, 4][Math.floor(i / beatInterval) % 6];
      const freq = params.baseFreq * Math.pow(2, noteOffset / 12);
      osc.frequency.setValueAtTime(freq, i);
    }

    // Create gain for volume envelope
    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = 0.3;

    // Add fade in/out
    gainNode.gain.setValueAtTime(0, 0);
    gainNode.gain.linearRampToValueAtTime(0.3, 0.5);
    gainNode.gain.setValueAtTime(0.3, Math.max(0, durationSecs - 1));
    gainNode.gain.linearRampToValueAtTime(0, durationSecs);

    // Connect nodes
    osc.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    // Start and stop
    osc.start(0);
    osc.stop(durationSecs);

    // Render to buffer
    const buffer = await offlineCtx.startRendering();

    // Convert to WAV blob
    const wavBlob = audioBufferToWav(buffer);
    return URL.createObjectURL(wavBlob);
  } catch (error) {
    console.error('Failed to generate demo audio:', error);
    return null;
  }
}

// Simple fallback tone generator
async function generateFallbackTone(durationSecs: number): Promise<string> {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * Math.min(durationSecs, 10));
  const offlineCtx = new OfflineAudioContext(1, numSamples, sampleRate);

  const osc = offlineCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 440;

  const gain = offlineCtx.createGain();
  gain.gain.value = 0.2;

  osc.connect(gain);
  gain.connect(offlineCtx.destination);

  osc.start(0);
  osc.stop(durationSecs);

  const buffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWav(buffer);
  return URL.createObjectURL(wavBlob);
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// ==========================================
// MAIN VOICE TO SONG COMPONENT
// ==========================================

const VoiceToSong: React.FC = () => {
  const { toast } = useToast();

  // Try to use global feedback for more visible notifications
  let globalFeedback: any = null;
  try {
    // Dynamic import to avoid breaking if not available
    const { useGlobalFeedback } = require('./GlobalFeedback');
    globalFeedback = useGlobalFeedback();
  } catch {
    // Fallback to toast only
  }

  // Helper to show feedback with fallback
  const showFeedback = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    // Use global feedback if available (more visible)
    if (globalFeedback) {
      globalFeedback[type](title, message);
    }
    // Also show toast as backup
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : type === 'success' ? 'success' : 'default',
    });
  };

  // State
  const [activeMode, setActiveMode] = useState<'lyrics' | 'voice' | 'describe'>('lyrics');
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pop');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [selectedVocal, setSelectedVocal] = useState('female');
  const [songDuration, setSongDuration] = useState(60);
  const [songDescription, setSongDescription] = useState('');

  // Voice recording state
  const [recordedMelody, setRecordedMelody] = useState<Blob | null>(null);
  const [melodyDuration, setMelodyDuration] = useState(0);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [generatedSong, setGeneratedSong] = useState<{
    audioUrl: string;
    title: string;
    duration: number;
  } | null>(null);

  // My Songs library - shared with MusicMakerPro
  const [mySongs, setMySongs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('smartpromptiq_generated_music');
      const all = saved ? JSON.parse(saved) : [];
      // Filter for songs only (sourceType = 'song-mode')
      return all.filter((t: any) => t.sourceType === 'song-mode');
    } catch {
      return [];
    }
  });
  const [showMySongs, setShowMySongs] = useState(false);

  // Save song to unified library
  const saveSongToLibrary = (song: { audioUrl: string; title: string; duration: number }) => {
    try {
      const saved = localStorage.getItem('smartpromptiq_generated_music');
      const allTracks = saved ? JSON.parse(saved) : [];

      const newSong = {
        id: `song-${Date.now()}`,
        name: song.title,
        genre: selectedStyle,
        mood: selectedMood,
        duration: song.duration,
        description: `AI Song • ${songStyles.find(s => s.id === selectedStyle)?.name || selectedStyle}`,
        prompt: activeMode === 'lyrics' ? (lyrics || '').slice(0, 500) : (songDescription || '').slice(0, 500) || 'Voice melody',
        fullLyrics: activeMode === 'lyrics' ? lyrics : undefined, // Save full lyrics for regeneration
        isAiGenerated: true,
        withVocals: true,
        vocalStyle: selectedVocal,
        sourceType: 'song-mode',
        createdAt: new Date().toISOString(),
        // Note: Blob URLs can't be persisted - audio will be regenerated on demand
        audioUrl: '',
        canRegenerate: true, // Flag indicating this song can be regenerated
      };

      allTracks.unshift(newSong);
      localStorage.setItem('smartpromptiq_generated_music', JSON.stringify(allTracks));

      // Update local state
      setMySongs(prev => [newSong, ...prev]);

      toast({
        title: 'Song Saved!',
        description: 'Your song has been added to your library',
      });
    } catch (err) {
      console.error('Error saving song:', err);
    }
  };

  // State for library playback
  const [libraryPlayingSongId, setLibraryPlayingSongId] = useState<string | null>(null);
  const [libraryLoadingSongId, setLibraryLoadingSongId] = useState<string | null>(null);
  const libraryAudioRef = useRef<HTMLAudioElement | null>(null);
  const libraryAudioCacheRef = useRef<Map<string, string>>(new Map());

  // Play song from library - regenerates audio if needed
  const playLibrarySong = async (song: any) => {
    // If already playing this song, pause it
    if (libraryPlayingSongId === song.id && libraryAudioRef.current) {
      libraryAudioRef.current.pause();
      setLibraryPlayingSongId(null);
      return;
    }

    // Check if we have cached audio for this song
    const cachedUrl = libraryAudioCacheRef.current.get(song.id);
    if (cachedUrl) {
      playLibraryAudio(song.id, cachedUrl, song.name);
      return;
    }

    // Need to regenerate audio
    setLibraryLoadingSongId(song.id);
    showFeedback('info', 'Generating Audio...', `Recreating "${song.name}"`);

    try {
      // Generate audio based on saved song data
      const audioUrl = await generateDemoAudio(song.genre || 'pop', song.duration || 30);

      if (audioUrl) {
        // Cache the generated audio
        libraryAudioCacheRef.current.set(song.id, audioUrl);
        playLibraryAudio(song.id, audioUrl, song.name);
        showFeedback('success', 'Now Playing', song.name);
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (err) {
      console.error('Library playback error:', err);
      showFeedback('error', 'Playback Failed', 'Could not generate audio for this song');
    } finally {
      setLibraryLoadingSongId(null);
    }
  };

  // Helper to play library audio
  const playLibraryAudio = (songId: string, audioUrl: string, songName: string) => {
    // Stop any currently playing audio
    if (libraryAudioRef.current) {
      libraryAudioRef.current.pause();
    }

    // Create new audio element
    const audio = new Audio(audioUrl);
    libraryAudioRef.current = audio;

    audio.onended = () => {
      setLibraryPlayingSongId(null);
    };

    audio.onerror = () => {
      console.error('Library audio error');
      setLibraryPlayingSongId(null);
      showFeedback('error', 'Playback Error', 'Audio failed to play');
    };

    audio.play()
      .then(() => {
        setLibraryPlayingSongId(songId);
      })
      .catch(err => {
        console.error('Library play error:', err);
        showFeedback('error', 'Playback Blocked', 'Click again to play');
      });
  };

  // Cleanup library audio on unmount
  useEffect(() => {
    return () => {
      if (libraryAudioRef.current) {
        libraryAudioRef.current.pause();
        libraryAudioRef.current = null;
      }
    };
  }, []);

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const isTransitioningRef = useRef(false);
  const songCacheRef = useRef<Map<string, string>>(new Map());

  // Apply lyrics template
  const applyTemplate = (template: typeof lyricsTemplates[0]) => {
    setLyrics(template.template);
    toast({ title: 'Template Applied', description: `"${template.name}" loaded - customize it!` });
  };

  // Handle melody recording
  const handleMelodyRecorded = (blob: Blob, duration: number) => {
    setRecordedMelody(blob);
    setMelodyDuration(duration);
    toast({
      title: 'Melody Recorded!',
      description: `${duration}s melody captured. AI will transform it into a song!`,
    });
  };

  // Generate song
  const generateSong = async () => {
    // Validation
    if (activeMode === 'lyrics' && !lyrics.trim()) {
      toast({ title: 'Enter Lyrics', description: 'Please write or select lyrics first', variant: 'destructive' });
      return;
    }
    if (activeMode === 'voice' && !recordedMelody) {
      toast({ title: 'Record Melody', description: 'Please record your melody first', variant: 'destructive' });
      return;
    }
    if (activeMode === 'describe' && !songDescription.trim()) {
      toast({ title: 'Describe Your Song', description: 'Please describe what kind of song you want', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const stages = [
      { progress: 20, stage: 'Analyzing your input...' },
      { progress: 40, stage: 'Composing melody and chords...' },
      { progress: 60, stage: 'Arranging instruments...' },
      { progress: 80, stage: 'Generating vocals...' },
      { progress: 95, stage: 'Final mastering...' },
    ];

    // Simulate generation stages
    for (const s of stages) {
      await new Promise(r => setTimeout(r, 2000));
      setGenerationProgress(s.progress);
      setGenerationStage(s.stage);
    }

    try {
      // Build the request
      const style = songStyles.find(s => s.id === selectedStyle);
      const mood = moodOptions.find(m => m.id === selectedMood);

      const requestBody: any = {
        genre: selectedStyle,
        mood: selectedMood,
        vocalStyle: selectedVocal,
        duration: songDuration,
        withVocals: true,
      };

      if (activeMode === 'lyrics') {
        requestBody.customLyrics = lyrics;
        requestBody.prompt = `${style?.name} song with ${mood?.name} mood. ${songTitle ? `Title: ${songTitle}` : ''}`;
      } else if (activeMode === 'describe') {
        requestBody.prompt = songDescription;
      } else if (activeMode === 'voice' && recordedMelody) {
        // For voice mode, we'd upload the audio - for now use description
        requestBody.prompt = `Create a ${style?.name} song based on a hummed melody. ${mood?.name} mood.`;
      }

      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success || data.audioUrl) {
        let audioUrl = data.audioUrl;

        // Handle demo mode - generate audio client-side
        if (audioUrl?.startsWith('generate-client-side:') || data.isDemo) {
          console.log('Demo mode - generating audio client-side');

          // Generate audio using Web Audio API
          const genre = audioUrl?.replace('generate-client-side:', '') || selectedStyle;
          audioUrl = await generateDemoAudio(genre, songDuration);

          if (!audioUrl) {
            toast({
              title: 'Demo Mode',
              description: 'Audio generation API not configured. Using demo audio.',
            });
            // Use a simple tone as fallback
            audioUrl = await generateFallbackTone(songDuration);
          }
        }

        const newSong = {
          audioUrl: audioUrl || '',
          title: songTitle || data.title || 'My AI Song',
          duration: data.duration || songDuration,
        };

        if (!newSong.audioUrl) {
          throw new Error('No audio URL available');
        }

        setGeneratedSong(newSong);
        setGenerationProgress(100);
        setGenerationStage('Your song is ready!');

        // Auto-save to library
        saveSongToLibrary(newSong);

        toast({
          title: 'Song Created & Saved!',
          description: 'Your AI-generated song is ready to play and saved to your library!',
        });

        // Setup audio after short delay
        setTimeout(async () => {
          setIsGenerating(false);
          setIsAudioLoaded(false);
          setAudioError(null);

          if (audioRef.current && data.audioUrl) {
            audioRef.current.src = data.audioUrl;

            // Wait for audio to be ready before attempting to play
            audioRef.current.oncanplaythrough = async () => {
              setIsAudioLoaded(true);
              console.log('Audio loaded and ready to play');

              // Try auto-play (may be blocked by browser)
              try {
                playPromiseRef.current = audioRef.current!.play();
                await playPromiseRef.current;
                playPromiseRef.current = null;
                setIsPlaying(true);
              } catch (err: any) {
                playPromiseRef.current = null;
                if (err?.name !== 'AbortError') {
                  console.log('Auto-play blocked by browser, user needs to click play');
                }
              }
            };

            audioRef.current.onerror = (e) => {
              console.error('Audio load error:', e);
              setAudioError('Failed to load the generated audio. Please try regenerating.');
            };

            // Trigger load
            audioRef.current.load();
          } else {
            setAudioError('No audio URL received from generation. Please try again.');
          }
        }, 1500);
      } else {
        throw new Error(data.message || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Song generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate song. Please try again.',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };

  // Safe pause helper - waits for any pending play to complete
  const safePause = async () => {
    if (!audioRef.current) return;

    // If there's a pending play promise, wait for it
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // Play was aborted, which is fine
      }
      playPromiseRef.current = null;
    }

    audioRef.current.pause();
  };

  // Safe play helper - tracks the promise
  const safePlay = async (): Promise<boolean> => {
    if (!audioRef.current) return false;

    try {
      playPromiseRef.current = audioRef.current.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;
      return true;
    } catch (err: any) {
      playPromiseRef.current = null;
      // AbortError is expected when play is interrupted
      if (err?.name === 'AbortError') {
        console.log('Play interrupted (expected during transitions)');
        return false;
      }
      console.error('Playback error:', err);
      setAudioError('Failed to play audio. Please try again.');
      return false;
    }
  };

  // Play/pause generated song
  const togglePlayback = async () => {
    if (!audioRef.current || !generatedSong) {
      toast({
        title: 'No Song Available',
        description: 'Please generate a song first',
        variant: 'destructive'
      });
      return;
    }

    // Check if audio source is set
    if (!audioRef.current.src || audioRef.current.src === window.location.href) {
      // No source set - try to set it
      if (generatedSong.audioUrl) {
        audioRef.current.src = generatedSong.audioUrl;
        setIsAudioLoaded(false);
        setAudioError(null);
      } else {
        toast({
          title: 'Audio Not Available',
          description: 'The generated audio URL is not available. Please regenerate the song.',
          variant: 'destructive'
        });
        return;
      }
    }

    // Prevent rapid clicking during transitions
    if (isTransitioningRef.current) {
      console.log('Audio transition in progress, ignoring click');
      return;
    }

    isTransitioningRef.current = true;
    setAudioError(null);

    if (isPlaying) {
      await safePause();
      setIsPlaying(false);
    } else {
      // If not loaded yet, wait for it
      if (!isAudioLoaded && audioRef.current.readyState < 3) {
        toast({
          title: 'Loading Audio...',
          description: 'Please wait for the audio to load',
        });

        // Wait for canplaythrough event
        const loadPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 10000);

          if (audioRef.current) {
            audioRef.current.oncanplaythrough = () => {
              clearTimeout(timeout);
              setIsAudioLoaded(true);
              resolve();
            };
            audioRef.current.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Audio failed to load'));
            };
            // Trigger load
            audioRef.current.load();
          }
        });

        try {
          await loadPromise;
        } catch (err: any) {
          setAudioError(err.message || 'Failed to load audio');
          toast({
            title: 'Audio Load Failed',
            description: 'Could not load the audio. Please try regenerating.',
            variant: 'destructive'
          });
          isTransitioningRef.current = false;
          return;
        }
      }

      const success = await safePlay();
      if (success) {
        setIsPlaying(true);
      }
    }

    isTransitioningRef.current = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
            <Music2 className="w-4 h-4 text-pink-400" />
            <span className="text-pink-300 text-sm font-medium">AI Song Creator</span>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">NEW</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
            Turn Your Voice Into a Song
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Write lyrics, hum a melody, or describe your song - AI will create a full track with vocals
          </p>
        </div>

        {/* My Songs Toggle */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowMySongs(!showMySongs)}
            variant={showMySongs ? "default" : "outline"}
            className={showMySongs
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              : "border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            }
          >
            <ListMusic className="w-4 h-4 mr-2" />
            My Songs ({mySongs.length})
          </Button>
        </div>

        {/* My Songs Library */}
        {showMySongs && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-purple-400" />
                My Song Library
              </CardTitle>
              <CardDescription>Your AI-generated songs are saved here</CardDescription>
            </CardHeader>
            <CardContent>
              {mySongs.length > 0 ? (
                <div className="space-y-3">
                  {mySongs.map((song, index) => (
                    <div
                      key={song.id || index}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{song.name}</h4>
                        <p className="text-gray-400 text-sm truncate">{song.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                            {song.genre}
                          </Badge>
                          <span className="text-xs text-gray-500">{song.duration}s</span>
                          {song.createdAt && (
                            <span className="text-xs text-gray-600">
                              {new Date(song.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className={`${
                            libraryPlayingSongId === song.id
                              ? 'bg-gradient-to-r from-red-500 to-orange-500'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                          disabled={libraryLoadingSongId === song.id}
                          onClick={() => playLibrarySong(song)}
                        >
                          {libraryLoadingSongId === song.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : libraryPlayingSongId === song.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => {
                            // Remove from library
                            const saved = localStorage.getItem('smartpromptiq_generated_music');
                            const all = saved ? JSON.parse(saved) : [];
                            const filtered = all.filter((t: any) => t.id !== song.id);
                            localStorage.setItem('smartpromptiq_generated_music', JSON.stringify(filtered));
                            setMySongs(filtered.filter((t: any) => t.sourceType === 'song-mode'));
                            toast({ title: 'Song removed from library' });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No songs yet</p>
                  <p className="text-gray-500 text-sm">Create your first AI song below!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mode Selection */}
        <div className="flex justify-center gap-3">
          {[
            { id: 'lyrics', label: 'Write Lyrics', icon: FileText, color: 'from-purple-500 to-pink-500' },
            { id: 'voice', label: 'Hum/Sing Melody', icon: Mic, color: 'from-orange-500 to-red-500' },
            { id: 'describe', label: 'Describe Song', icon: Wand2, color: 'from-cyan-500 to-blue-500' },
          ].map((mode) => (
            <Button
              key={mode.id}
              onClick={() => { setActiveMode(mode.id as any); setShowMySongs(false); }}
              className={`px-6 py-6 h-auto flex-col gap-2 transition-all ${
                activeMode === mode.id && !showMySongs
                  ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                  : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <mode.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{mode.label}</span>
            </Button>
          ))}
        </div>

        {isGenerating ? (
          <SongGenerationProgress progress={generationProgress} stage={generationStage} />
        ) : generatedSong ? (
          /* Generated Song Player */
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Album Art */}
                <div className="relative">
                  <div className={`w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                    <Disc3 className={`w-20 h-20 text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
                  </div>
                  {isPlaying && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-1 bg-white rounded-full animate-bounce" style={{ height: `${10 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white">{generatedSong.title}</h2>
                  <p className="text-gray-400">AI Generated • {generatedSong.duration}s</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    onClick={togglePlayback}
                    size="lg"
                    disabled={isTransitioningRef.current}
                    className={`h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 ${
                      isTransitioningRef.current ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isTransitioningRef.current ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                  {!isAudioLoaded && !audioError && generatedSong?.audioUrl && (
                    <p className="text-sm text-gray-400">Loading audio...</p>
                  )}
                  {isAudioLoaded && !isPlaying && !audioError && (
                    <p className="text-sm text-gray-400">Click to play</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="border-pink-500/50 text-pink-300">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300"
                    onClick={() => setGeneratedSong(null)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Create Another
                  </Button>
                </div>

                {/* Show error if any */}
                {audioError && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {audioError}
                  </div>
                )}

                <audio
                  ref={audioRef}
                  src={generatedSong?.audioUrl || ''}
                  preload="auto"
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onCanPlayThrough={() => setIsAudioLoaded(true)}
                  onLoadStart={() => {
                    setIsAudioLoaded(false);
                    setAudioError(null);
                  }}
                  onError={(e) => {
                    console.error('Audio element error:', e);
                    setIsPlaying(false);
                    setIsAudioLoaded(false);
                    const audio = e.currentTarget as HTMLAudioElement;
                    if (audio.src && audio.src !== window.location.href) {
                      setAudioError('Failed to load audio. The audio source may be unavailable.');
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Input Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lyrics Mode */}
              {activeMode === 'lyrics' && (
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Write Your Lyrics
                    </CardTitle>
                    <CardDescription>
                      Write your own lyrics or use a template. Include [Verse], [Chorus], [Bridge] markers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="Song Title (optional)"
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="Write your lyrics here...

[Verse 1]
Your first verse goes here...

[Chorus]
Your catchy chorus...

[Verse 2]
Continue your story..."
                      className="min-h-[300px] bg-slate-800/50 border-slate-600 text-white font-mono"
                    />

                    {/* Templates */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Or start with a template:</p>
                      <div className="flex flex-wrap gap-2">
                        {lyricsTemplates.map((t) => (
                          <Button
                            key={t.id}
                            variant="outline"
                            size="sm"
                            onClick={() => applyTemplate(t)}
                            className="border-slate-600 text-gray-300 hover:border-purple-500/50"
                          >
                            {t.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Voice Mode */}
              {activeMode === 'voice' && (
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-orange-400" />
                      Record Your Melody
                    </CardTitle>
                    <CardDescription>
                      Hum, whistle, or sing your melody idea. AI will turn it into a full song!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VoiceMelodyRecorder onRecordingComplete={handleMelodyRecorded} />

                    {recordedMelody && (
                      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Melody Recorded!</p>
                              <p className="text-gray-400 text-sm">{melodyDuration}s captured</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRecordedMelody(null)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Describe Mode */}
              {activeMode === 'describe' && (
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-cyan-400" />
                      Describe Your Song
                    </CardTitle>
                    <CardDescription>
                      Tell the AI what kind of song you want. Be as detailed as possible!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={songDescription}
                      onChange={(e) => setSongDescription(e.target.value)}
                      placeholder="Describe your song...

Example: A upbeat pop song about summer love, with catchy hooks and a danceable beat. Include a female vocal with harmonies in the chorus. The song should build from a mellow verse to an energetic chorus. Themes of joy, freedom, and new beginnings."
                      className="min-h-[250px] bg-slate-800/50 border-slate-600 text-white"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Song Settings */}
            <div className="space-y-6">
              {/* Style Selection */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Song Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {songStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-xl text-left transition-all ${
                          selectedStyle === style.id
                            ? `bg-gradient-to-r ${style.color} text-white`
                            : 'bg-slate-800/50 hover:bg-slate-800 text-gray-300'
                        }`}
                      >
                        <style.icon className="w-5 h-5 mb-1" />
                        <div className="text-sm font-medium">{style.name}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mood Selection */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Mood</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`p-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          selectedMood === mood.id
                            ? 'bg-purple-500/30 border border-purple-500/50 text-white'
                            : 'bg-slate-800/50 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{mood.emoji}</span>
                        <span>{mood.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vocal Style */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Vocal Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedVocal} onValueChange={setSelectedVocal}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vocalStyles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} - {v.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Duration */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={songDuration.toString()} onValueChange={(v) => setSongDuration(Number(v))}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds (Clip)</SelectItem>
                      <SelectItem value="60">1 minute (Short)</SelectItem>
                      <SelectItem value="120">2 minutes (Standard)</SelectItem>
                      <SelectItem value="180">3 minutes (Full)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={generateSong}
                size="lg"
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 shadow-lg shadow-purple-500/30"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create My Song
              </Button>

              <p className="text-center text-gray-500 text-sm">
                ~100 tokens per song generation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceToSong;
