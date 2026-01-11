import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Mic, MicOff, Play, Pause, Square, Volume2, VolumeX,
  Music, Upload, Download, Trash2, Plus, Settings2,
  Layers, Sliders, RefreshCw, Save, FolderOpen,
  AudioWaveform, Sparkles, Zap, Clock, ChevronRight,
  Headphones, Radio, SkipBack, SkipForward, Repeat, Activity
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

interface AudioTrack {
  id: string;
  name: string;
  type: 'voice' | 'music';
  audioUrl: string;
  duration: number;
  volume: number;
  startTime: number; // When to start in the timeline
  fadeIn?: number;
  fadeOut?: number;
  muted: boolean;
}

interface MixerProject {
  id: string;
  name: string;
  tracks: AudioTrack[];
  masterVolume: number;
  duration: number;
  autoDuck: boolean; // Auto-lower music when voice plays
  duckAmount: number; // How much to lower music (0-1)
}

// ==========================================
// WAVEFORM VISUALIZER
// ==========================================

const WaveformVisualizer: React.FC<{
  audioUrl: string;
  isPlaying: boolean;
  progress: number;
  color?: string;
  height?: number;
}> = ({ audioUrl, isPlaying, progress, color = '#8b5cf6', height = 60 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Generate fake waveform data for visualization
    const bars = 100;
    const data = Array.from({ length: bars }, () =>
      0.2 + Math.random() * 0.6 + Math.sin(Math.random() * Math.PI) * 0.2
    );
    setWaveformData(data);
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;

      const progressPoint = (progress / 100) * waveformData.length;
      const isPast = index < progressPoint;

      ctx.fillStyle = isPast ? color : `${color}40`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [waveformData, progress, color, height]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={height}
      className="w-full rounded-lg bg-slate-900/50"
    />
  );
};

// ==========================================
// VOICE RECORDER
// ==========================================

const VoiceRecorder: React.FC<{
  onRecordingComplete: (audioUrl: string, duration: number) => void;
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

      // Set up audio analysis for level meter
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start level monitoring
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onRecordingComplete(audioUrl, recordingTime);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          size="lg"
          className={`h-16 w-16 rounded-full transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
          }`}
        >
          {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
      </div>

      {isRecording && (
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-medium">Recording</span>
          </div>
          <div className="text-3xl font-bold text-white">{formatTime(recordingTime)}</div>

          {/* Audio Level Meter */}
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-8 rounded-full transition-all ${
                  i / 20 < audioLevel
                    ? i < 14 ? 'bg-green-500' : i < 17 ? 'bg-yellow-500' : 'bg-red-500'
                    : 'bg-slate-700'
                }`}
                style={{ height: `${(Math.sin(i * 0.5) + 1.5) * 12}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {!isRecording && (
        <p className="text-center text-gray-400 text-sm">
          Click the microphone to start recording your voice
        </p>
      )}
    </div>
  );
};

// ==========================================
// TRACK CONTROL COMPONENT
// ==========================================

const TrackControl: React.FC<{
  track: AudioTrack;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onRemove: () => void;
  isPlaying: boolean;
  progress: number;
}> = ({ track, onVolumeChange, onMuteToggle, onRemove, isPlaying, progress }) => {
  const colorMap = {
    voice: '#f97316',
    music: '#8b5cf6',
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Track Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            track.type === 'voice'
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {track.type === 'voice' ? <Mic className="w-5 h-5" /> : <Music className="w-5 h-5" />}
          </div>

          {/* Track Info & Waveform */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium truncate">{track.name}</span>
              <Badge variant="outline" className="text-xs">
                {Math.floor(track.duration)}s
              </Badge>
            </div>
            <WaveformVisualizer
              audioUrl={track.audioUrl}
              isPlaying={isPlaying}
              progress={progress}
              color={colorMap[track.type]}
              height={40}
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <Button
              size="icon"
              variant="ghost"
              onClick={onMuteToggle}
              className={track.muted ? 'text-red-400' : 'text-gray-400'}
            >
              {track.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[track.muted ? 0 : track.volume]}
              onValueChange={([v]) => onVolumeChange(v)}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-8">
              {Math.round(track.volume * 100)}%
            </span>
          </div>

          {/* Remove Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ==========================================
// MUSIC LIBRARY PICKER
// ==========================================

// Generate procedural music for mixer
const generateMixerTrack = (genre: string, duration: number = 15): Promise<string> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = audioContext.createBuffer(2, numSamples, sampleRate);

    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    // 🎵 PREMIUM GENRE PARAMETERS FOR RICH AUDIO SYNTHESIS
    const genreParams: Record<string, any> = {
      Upbeat: { bpm: 128, notes: [523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25, 659.25], bass: 130.81, intensity: 85 },
      Calm: { bpm: 68, notes: [261.63, 329.63, 392.00, 329.63, 261.63, 220.00, 261.63, 329.63], bass: 65.41, intensity: 25 },
      Corporate: { bpm: 105, notes: [440.00, 523.25, 659.25, 523.25, 440.00, 392.00, 440.00, 523.25], bass: 110.00, intensity: 55 },
      Cinematic: { bpm: 80, notes: [220.00, 293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 293.66], bass: 55.00, intensity: 90 },
      Electronic: { bpm: 138, notes: [329.63, 440.00, 554.37, 659.25, 554.37, 440.00, 329.63, 440.00], bass: 82.41, intensity: 80 },
      'Lo-Fi': { bpm: 82, notes: [293.66, 349.23, 440.00, 392.00, 349.23, 293.66, 329.63, 392.00], bass: 73.42, intensity: 35 },
      Inspirational: { bpm: 110, notes: [392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00], bass: 98.00, intensity: 70 },
      Tropical: { bpm: 112, notes: [349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 349.23, 392.00], bass: 87.31, intensity: 65 },
      'Hip-Hop': { bpm: 92, notes: [293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 329.63], bass: 73.42, intensity: 70 },
    };

    const p = genreParams[genre] || genreParams.Upbeat;
    const beatDuration = 60 / p.bpm;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beatNum = Math.floor(t / beatDuration);
      const beatPhase = (t % beatDuration) / beatDuration;

      let sample = 0;

      // Bass
      sample += Math.sin(2 * Math.PI * p.bass * t) * 0.25 * Math.exp(-beatPhase * 3);

      // Melody
      const noteFreq = p.notes[beatNum % p.notes.length];
      sample += Math.sin(2 * Math.PI * noteFreq * t) * 0.12 * Math.exp(-beatPhase * 2);
      sample += Math.sin(2 * Math.PI * noteFreq * 1.5 * t) * 0.06 * Math.exp(-beatPhase * 2);

      // Kick
      if (beatPhase < 0.08) {
        sample += Math.sin(2 * Math.PI * 60 * Math.exp(-beatPhase * 25) * t) * 0.35;
      }

      // Soft limit
      sample = Math.tanh(sample * 0.7);

      leftChannel[i] = sample;
      rightChannel[i] = sample * 0.98;
    }

    // Convert to WAV
    const wavData = mixerBufferToWav(buffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    resolve(URL.createObjectURL(blob));
  });
};

function mixerBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

const MusicLibraryPicker: React.FC<{
  onSelect: (track: { name: string; audioUrl: string; duration: number }) => void;
}> = ({ onSelect }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // ==========================================
  // 🎵 PREMIUM MUSIC TRACKS FOR MIXER - 25+ TRACKS! 🎵
  // ==========================================
  const musicTracks = [
    // ⚡ UPBEAT & ENERGETIC
    { id: 'rise-and-shine', name: 'Rise & Shine', genre: 'Upbeat', duration: 30, trending: true },
    { id: 'victory-lap', name: 'Victory Lap', genre: 'Upbeat', duration: 25 },
    { id: 'unstoppable-force', name: 'Unstoppable Force', genre: 'Upbeat', duration: 20 },
    { id: 'power-surge', name: 'Power Surge', genre: 'Upbeat', duration: 20 },

    // 🌊 CALM & RELAXING
    { id: 'ocean-breeze', name: 'Ocean Breeze', genre: 'Calm', duration: 45, featured: true },
    { id: 'forest-dawn', name: 'Forest Dawn', genre: 'Calm', duration: 50 },
    { id: 'zen-garden', name: 'Zen Garden', genre: 'Calm', duration: 60 },
    { id: 'starlit-dreams', name: 'Starlit Dreams', genre: 'Calm', duration: 45 },

    // 💼 CORPORATE & PROFESSIONAL
    { id: 'innovation-drive', name: 'Innovation Drive', genre: 'Corporate', duration: 30, trending: true },
    { id: 'success-story', name: 'Success Story', genre: 'Corporate', duration: 25 },
    { id: 'future-vision', name: 'Future Vision', genre: 'Corporate', duration: 30 },
    { id: 'boardroom-excellence', name: 'Boardroom Excellence', genre: 'Corporate', duration: 25 },

    // 🎬 CINEMATIC & EPIC
    { id: 'epic-journey', name: 'Epic Journey', genre: 'Cinematic', duration: 40, featured: true },
    { id: 'dramatic-rise', name: 'Dramatic Rise', genre: 'Cinematic', duration: 30 },
    { id: 'heroes-anthem', name: 'Heroes Anthem', genre: 'Cinematic', duration: 35 },
    { id: 'dawn-of-legends', name: 'Dawn of Legends', genre: 'Cinematic', duration: 35 },

    // 🎧 ELECTRONIC & MODERN
    { id: 'digital-dreams', name: 'Digital Dreams', genre: 'Electronic', duration: 30, trending: true },
    { id: 'cyber-wave', name: 'Cyber Wave', genre: 'Electronic', duration: 25 },
    { id: 'neon-nights', name: 'Neon Nights', genre: 'Electronic', duration: 30 },
    { id: 'binary-sunset', name: 'Binary Sunset', genre: 'Electronic', duration: 25 },

    // ☕ LO-FI & CHILL
    { id: 'study-session', name: 'Study Session', genre: 'Lo-Fi', duration: 50, featured: true },
    { id: 'late-night-coding', name: 'Late Night Coding', genre: 'Lo-Fi', duration: 60 },
    { id: 'coffee-shop-vibes', name: 'Coffee Shop Vibes', genre: 'Lo-Fi', duration: 40 },
    { id: 'rainy-afternoon', name: 'Rainy Afternoon', genre: 'Lo-Fi', duration: 45 },

    // ✨ MORE GENRES
    { id: 'new-beginnings', name: 'New Beginnings', genre: 'Inspirational', duration: 30 },
    { id: 'island-paradise', name: 'Island Paradise', genre: 'Tropical', duration: 30 },
    { id: 'urban-vibes', name: 'Urban Vibes', genre: 'Hip-Hop', duration: 30 },
    { id: 'night-rider', name: 'Night Rider', genre: 'Hip-Hop', duration: 25 },
  ];

  const handleSelect = async (track: typeof musicTracks[0]) => {
    setIsGenerating(true);
    setGeneratingId(track.id);

    try {
      const audioUrl = await generateMixerTrack(track.genre, track.duration);
      onSelect({ name: track.name, audioUrl, duration: track.duration });
    } catch (err) {
      console.error('Failed to generate track:', err);
    } finally {
      setIsGenerating(false);
      setGeneratingId(null);
    }
  };

  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const genres = ['All', 'Upbeat', 'Calm', 'Corporate', 'Cinematic', 'Electronic', 'Lo-Fi', 'Inspirational', 'Tropical', 'Hip-Hop'];

  const filteredTracks = selectedGenre && selectedGenre !== 'All'
    ? musicTracks.filter(t => t.genre === selectedGenre)
    : musicTracks;

  return (
    <div className="space-y-4">
      {/* Genre Filter */}
      <div className="flex gap-2 flex-wrap">
        {genres.map(genre => (
          <Button
            key={genre}
            size="sm"
            variant={selectedGenre === genre || (genre === 'All' && !selectedGenre) ? 'default' : 'outline'}
            onClick={() => setSelectedGenre(genre === 'All' ? '' : genre)}
            className="text-xs"
          >
            {genre}
          </Button>
        ))}
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {filteredTracks.map(track => (
          <button
            key={track.id}
            onClick={() => handleSelect(track)}
            disabled={isGenerating}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                {generatingId === track.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Music className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{track.name}</p>
                <p className="text-gray-400 text-xs">
                  {generatingId === track.id ? 'Generating...' : `${track.genre} • ${track.duration}s`}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MAIN VOICE MUSIC MIXER COMPONENT
// ==========================================

const VoiceMusicMixer: React.FC = () => {
  const { toast } = useToast();

  // Project state
  const [project, setProject] = useState<MixerProject>({
    id: `project-${Date.now()}`,
    name: 'Untitled Mix',
    tracks: [],
    masterVolume: 0.8,
    duration: 0,
    autoDuck: true,
    duckAmount: 0.3,
  });

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // UI state
  const [activeTab, setActiveTab] = useState<'record' | 'library' | 'upload'>('record');
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Audio refs
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const playPromisesRef = useRef<Map<string, Promise<void>>>(new Map());
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);

  // Calculate total duration based on tracks
  useEffect(() => {
    if (project.tracks.length > 0) {
      const maxDuration = Math.max(...project.tracks.map(t => t.startTime + t.duration));
      setProject(prev => ({ ...prev, duration: maxDuration }));
    }
  }, [project.tracks]);

  // Add voice recording
  const handleRecordingComplete = (audioUrl: string, duration: number) => {
    const newTrack: AudioTrack = {
      id: `voice-${Date.now()}`,
      name: `Voice Recording ${project.tracks.filter(t => t.type === 'voice').length + 1}`,
      type: 'voice',
      audioUrl,
      duration,
      volume: 1,
      startTime: 0,
      muted: false,
    };

    setProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
    }));

    toast({
      title: 'Recording Added',
      description: `${duration}s voice recording added to the mix`,
    });
  };

  // Add music from library
  const handleMusicSelect = (track: { name: string; audioUrl: string; duration: number }) => {
    const newTrack: AudioTrack = {
      id: `music-${Date.now()}`,
      name: track.name,
      type: 'music',
      audioUrl: track.audioUrl,
      duration: track.duration,
      volume: 0.5, // Start music at 50% volume
      startTime: 0,
      muted: false,
    };

    setProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
    }));

    toast({
      title: 'Music Added',
      description: `"${track.name}" added to the mix`,
    });
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'voice' | 'music') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);

    audio.onloadedmetadata = () => {
      const newTrack: AudioTrack = {
        id: `${type}-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type,
        audioUrl,
        duration: audio.duration,
        volume: type === 'music' ? 0.5 : 1,
        startTime: 0,
        muted: false,
      };

      setProject(prev => ({
        ...prev,
        tracks: [...prev.tracks, newTrack],
      }));

      toast({
        title: 'File Added',
        description: `"${file.name}" added to the mix`,
      });
    };
  };

  // Update track volume
  const updateTrackVolume = (trackId: string, volume: number) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, volume } : t
      ),
    }));
  };

  // Toggle track mute
  const toggleTrackMute = (trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, muted: !t.muted } : t
      ),
    }));
  };

  // Remove track
  const removeTrack = (trackId: string) => {
    setProject(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId),
    }));
    audioRefs.current.delete(trackId);
  };

  // Safe pause all audio - waits for pending play promises
  const safePauseAll = async () => {
    // Wait for all pending play promises
    const promises = Array.from(playPromisesRef.current.values());
    if (promises.length > 0) {
      await Promise.allSettled(promises);
      playPromisesRef.current.clear();
    }

    // Now pause all audio
    audioRefs.current.forEach(audio => audio.pause());
  };

  // Playback controls
  const playMix = async () => {
    if (project.tracks.length === 0) {
      toast({ title: 'No tracks', description: 'Add some tracks first!', variant: 'destructive' });
      return;
    }

    // Prevent rapid toggling
    if (isTransitioningRef.current) {
      console.log('Mix transition in progress, ignoring');
      return;
    }

    isTransitioningRef.current = true;
    setIsPlaying(true);

    // Create audio elements for each track
    for (const track of project.tracks) {
      if (!audioRefs.current.has(track.id)) {
        const audio = new Audio(track.audioUrl);
        audioRefs.current.set(track.id, audio);
      }

      const audio = audioRefs.current.get(track.id)!;
      audio.volume = track.muted ? 0 : track.volume * project.masterVolume;
      audio.currentTime = Math.max(0, currentTime - track.startTime);

      if (currentTime >= track.startTime && currentTime < track.startTime + track.duration) {
        try {
          const playPromise = audio.play();
          playPromisesRef.current.set(track.id, playPromise);
          await playPromise;
          playPromisesRef.current.delete(track.id);
        } catch (err: any) {
          playPromisesRef.current.delete(track.id);
          // AbortError is expected when play is interrupted
          if (err?.name !== 'AbortError') {
            console.error('Track play error:', err);
          }
        }
      }
    }

    isTransitioningRef.current = false;

    // Update playback progress
    playbackIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= project.duration) {
          stopMix();
          return 0;
        }

        // Apply auto-ducking
        if (project.autoDuck) {
          const hasVoicePlaying = project.tracks.some(t =>
            t.type === 'voice' && !t.muted &&
            newTime >= t.startTime && newTime < t.startTime + t.duration
          );

          project.tracks.forEach(track => {
            if (track.type === 'music') {
              const audio = audioRefs.current.get(track.id);
              if (audio) {
                const targetVolume = hasVoicePlaying
                  ? track.volume * project.masterVolume * (1 - project.duckAmount)
                  : track.volume * project.masterVolume;
                audio.volume = track.muted ? 0 : targetVolume;
              }
            }
          });
        }

        setPlaybackProgress((newTime / project.duration) * 100);
        return newTime;
      });
    }, 100);
  };

  const pauseMix = async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setIsPlaying(false);
    await safePauseAll();
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    isTransitioningRef.current = false;
  };

  const stopMix = async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setIsPlaying(false);
    setCurrentTime(0);
    setPlaybackProgress(0);

    await safePauseAll();

    audioRefs.current.forEach(audio => {
      audio.currentTime = 0;
    });

    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    isTransitioningRef.current = false;
  };

  // Export mix
  const exportMix = async () => {
    if (project.tracks.length === 0) {
      toast({ title: 'No tracks to export', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    toast({ title: 'Preparing export...', description: 'This may take a moment' });

    try {
      // Create offline audio context for rendering
      const sampleRate = 44100;
      const duration = project.duration;
      const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

      // Load and decode all audio tracks
      const trackPromises = project.tracks.map(async (track) => {
        if (track.muted) return null;

        const response = await fetch(track.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

        return { track, audioBuffer };
      });

      const loadedTracks = (await Promise.all(trackPromises)).filter(Boolean) as Array<{
        track: AudioTrack;
        audioBuffer: AudioBuffer;
      }>;

      // Connect tracks to offline context
      loadedTracks.forEach(({ track, audioBuffer }) => {
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = track.volume * project.masterVolume;

        source.connect(gainNode);
        gainNode.connect(offlineCtx.destination);

        source.start(track.startTime);
      });

      // Render
      const renderedBuffer = await offlineCtx.startRendering();

      // Convert to WAV
      const wavBlob = audioBufferToWav(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);

      // Download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_mix.wav`;
      a.click();

      toast({
        title: 'Export Complete!',
        description: 'Your mixed audio has been downloaded',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your mix',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-purple-500/30">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Voice + Music Mixer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent">
            Mix Your Voice with Music
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Record or upload your voice, add background music, adjust levels, and export a polished audio mix
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Add Tracks Panel */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Add Tracks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="record">
                    <Mic className="w-4 h-4 mr-1" />
                    Record
                  </TabsTrigger>
                  <TabsTrigger value="library">
                    <Music className="w-4 h-4 mr-1" />
                    Library
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="mt-4">
                  <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                </TabsContent>

                <TabsContent value="library" className="mt-4">
                  <MusicLibraryPicker onSelect={handleMusicSelect} />
                </TabsContent>

                <TabsContent value="upload" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <label className="block">
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 hover:border-purple-500/50 transition-colors cursor-pointer text-center">
                        <Mic className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Upload Voice</p>
                        <p className="text-gray-400 text-sm">MP3, WAV, M4A</p>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'voice')}
                        />
                      </div>
                    </label>

                    <label className="block">
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 hover:border-purple-500/50 transition-colors cursor-pointer text-center">
                        <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Upload Music</p>
                        <p className="text-gray-400 text-sm">MP3, WAV, M4A</p>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'music')}
                        />
                      </div>
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Center & Right: Mixer & Tracks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Master Controls */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-6">
                  {/* Playback Controls */}
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={stopMix}
                      className="text-gray-400 hover:text-white"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>

                    <Button
                      size="lg"
                      onClick={isPlaying ? pauseMix : playMix}
                      className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={stopMix}
                      className="text-gray-400 hover:text-white"
                    >
                      <Square className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Time & Progress */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(project.duration)}</span>
                    </div>
                    <Progress value={playbackProgress} className="h-2" />
                  </div>

                  {/* Master Volume */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <Slider
                      value={[project.masterVolume]}
                      onValueChange={([v]) => setProject(prev => ({ ...prev, masterVolume: v }))}
                      max={1}
                      step={0.01}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-8">
                      {Math.round(project.masterVolume * 100)}%
                    </span>
                  </div>

                  {/* Export */}
                  <Button
                    onClick={exportMix}
                    disabled={project.tracks.length === 0 || isExporting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    {isExporting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export
                  </Button>
                </div>

                {/* Auto-Duck Settings */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoDuck"
                        checked={project.autoDuck}
                        onChange={(e) => setProject(prev => ({ ...prev, autoDuck: e.target.checked }))}
                        className="rounded border-slate-600 bg-slate-800"
                      />
                      <label htmlFor="autoDuck" className="text-sm text-gray-300">
                        Auto-duck music when voice plays
                      </label>
                    </div>

                    {project.autoDuck && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Duck amount:</span>
                        <Slider
                          value={[project.duckAmount]}
                          onValueChange={([v]) => setProject(prev => ({ ...prev, duckAmount: v }))}
                          max={0.8}
                          min={0.1}
                          step={0.1}
                          className="w-24"
                        />
                        <span className="text-xs text-gray-400">
                          {Math.round(project.duckAmount * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Track List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Tracks ({project.tracks.length})</h3>
                {project.tracks.length > 0 && (
                  <Badge variant="outline" className="text-gray-400">
                    Total: {formatTime(project.duration)}
                  </Badge>
                )}
              </div>

              {project.tracks.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-700 border-dashed">
                  <CardContent className="p-12 text-center">
                    <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No tracks yet</p>
                    <p className="text-gray-500 text-sm">Record voice or add music to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {project.tracks.map((track) => (
                    <TrackControl
                      key={track.id}
                      track={track}
                      isPlaying={isPlaying}
                      progress={
                        currentTime >= track.startTime && currentTime < track.startTime + track.duration
                          ? ((currentTime - track.startTime) / track.duration) * 100
                          : 0
                      }
                      onVolumeChange={(v) => updateTrackVolume(track.id, v)}
                      onMuteToggle={() => toggleTrackMute(track.id)}
                      onRemove={() => removeTrack(track.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// HELPER: Convert AudioBuffer to WAV
// ==========================================

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const samples = buffer.length;
  const dataLength = samples * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write interleaved samples
  const offset = 44;
  const channelData: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < samples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), intSample, true);
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default VoiceMusicMixer;
