import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useVoiceActivation from '@/hooks/useVoiceActivation';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  onTranscript?: (transcript: string) => void;
  className?: string;
  showTranscript?: boolean;
  personality?: 'professional' | 'friendly' | 'enthusiastic';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommand,
  onTranscript,
  className = '',
  showTranscript = true,
  personality = 'friendly',
  position = 'bottom-right',
  size = 'md',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentTranscripts, setRecentTranscripts] = useState<string[]>([]);

  const voice = useVoiceActivation({
    wakeWord: 'hey builder',
    voicePersonality: personality,
    speakResponses: true,
    onCommand: (cmd) => {
      onCommand?.(cmd);
    },
    onTranscript: (transcript) => {
      onTranscript?.(transcript);
      setRecentTranscripts(prev => [...prev.slice(-4), transcript]);
    },
    onWakeWordDetected: () => {
      setIsExpanded(true);
    },
  });

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'center': 'bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2',
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <>
      {/* Main floating button */}
      <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    {voice.isListening && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="font-semibold text-white">BuilderIQ Voice</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Status */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${voice.isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-sm text-gray-300">
                    {voice.isListening
                      ? voice.isWakeWordDetected
                        ? 'Listening for commands...'
                        : 'Say "Hey Builder" to activate'
                      : 'Click mic to start'
                    }
                  </span>
                </div>

                {/* Audio visualizer */}
                {voice.isListening && (
                  <div className="flex items-center justify-center gap-1 h-12 mb-4">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                        animate={{
                          height: voice.isListening
                            ? [4, 4 + Math.random() * 30 * voice.audioLevel, 4]
                            : 4,
                        }}
                        transition={{
                          duration: 0.15,
                          repeat: Infinity,
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Interim transcript */}
                {voice.interimTranscript && (
                  <div className="p-3 bg-slate-800/50 rounded-xl mb-4">
                    <p className="text-gray-300 text-sm italic">
                      "{voice.interimTranscript}"
                    </p>
                  </div>
                )}

                {/* Recent transcripts */}
                {showTranscript && recentTranscripts.length > 0 && (
                  <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    {recentTranscripts.map((t, i) => (
                      <div
                        key={i}
                        className="text-sm text-gray-400 p-2 bg-slate-800/30 rounded-lg"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                )}

                {/* Error message with helpful actions */}
                {voice.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-400 text-sm font-medium mb-2">Microphone Access Required</p>
                        <div className="text-gray-300 text-xs space-y-2 bg-slate-800/50 rounded-lg p-3">
                          <p className="font-semibold text-yellow-400">Quick Fix (3 steps):</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Click the <span className="bg-slate-600 px-1 rounded">lock/info icon</span> in your address bar (left of URL)</li>
                            <li>Find <span className="font-semibold">"Microphone"</span> and change to <span className="text-green-400">"Allow"</span></li>
                            <li>Click the <span className="text-blue-400 font-semibold">Refresh</span> button below</li>
                          </ol>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              // Try to re-request permission
                              navigator.mediaDevices.getUserMedia({ audio: true })
                                .then(stream => {
                                  stream.getTracks().forEach(t => t.stop());
                                  window.location.reload();
                                })
                                .catch(() => {
                                  // If still denied, just reload
                                  window.location.reload();
                                });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Refresh Page
                          </button>
                          <button
                            onClick={() => voice.openMicrophoneSettings()}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 rounded transition-colors"
                          >
                            <Settings className="w-3 h-3" />
                            More Help
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Permission prompt when not yet granted */}
                {voice.permissionStatus === 'prompt' && !voice.isListening && !voice.error && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
                    <div className="flex items-start gap-2">
                      <Mic className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-blue-300 text-sm">Microphone access is required for voice commands.</p>
                        <button
                          onClick={async () => {
                            const granted = await voice.requestPermission();
                            if (granted) {
                              voice.activateDirectly();
                            }
                          }}
                          className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                        >
                          Enable Microphone
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick commands */}
                <div className="flex flex-wrap gap-2">
                  {['Create app', 'Templates', 'Help'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => voice.speak(cmd)}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-full transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer controls */}
              <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50">
                <button
                  onClick={() => voice.isSpeaking ? voice.stopSpeaking() : voice.speak("BuilderIQ ready!")}
                  className={`p-2 rounded-lg transition-colors ${
                    voice.isSpeaking ? 'bg-purple-500 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  {voice.isSpeaking ? (
                    <Volume2 className="w-5 h-5 animate-pulse" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={voice.toggleListening}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    voice.isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {voice.isListening ? 'Stop' : 'Start Listening'}
                </button>

                <button
                  onClick={voice.clearTranscript}
                  className="p-2 rounded-lg bg-slate-700 text-gray-400 hover:bg-slate-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating mic button */}
        <motion.button
          onClick={() => {
            if (!isExpanded) {
              setIsExpanded(true);
              voice.activateDirectly();
            } else {
              voice.toggleListening();
            }
          }}
          className={`
            ${sizeClasses[size]}
            rounded-full
            flex items-center justify-center
            shadow-lg
            transition-all duration-300
            ${voice.isListening
              ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/40'
              : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/40 hover:shadow-purple-500/60'
            }
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulse effect when listening */}
          {voice.isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-pink-400"
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
            </>
          )}

          {/* Audio level indicator */}
          {voice.isListening && voice.audioLevel > 0.1 && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/50"
              animate={{
                scale: 1 + voice.audioLevel * 0.3,
                opacity: voice.audioLevel,
              }}
              transition={{ duration: 0.1 }}
            />
          )}

          {voice.isListening ? (
            <MicOff className={`${iconSizes[size]} text-white relative z-10`} />
          ) : (
            <Mic className={`${iconSizes[size]} text-white relative z-10`} />
          )}
        </motion.button>

        {/* Wake word hint */}
        {!voice.isListening && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <span className="px-3 py-1.5 bg-slate-800/90 text-gray-300 text-sm rounded-lg border border-slate-700">
              Say "Hey Builder" 🎤
            </span>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default VoiceAssistant;
