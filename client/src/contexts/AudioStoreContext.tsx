/**
 * AudioStoreContext - Cross-Builder Audio Transfer System
 *
 * This context enables audio sharing between different builders:
 * - Voice Builder -> Video Builder
 * - Music Builder -> Video Builder
 * - Suno Music Builder -> Video Builder / Voice Builder
 *
 * Features:
 * - Session-based storage (persists across page navigation)
 * - Automatic Blob URL cleanup to prevent memory leaks
 * - Type-safe audio asset management
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Audio asset types
export type AudioAssetType = 'voice' | 'music' | 'effect' | 'intro' | 'outro' | 'background';

export interface AudioAsset {
  id: string;
  type: AudioAssetType;
  name: string;
  url: string;                    // Base64 data URL or Blob URL
  duration?: number;              // Duration in seconds
  source: string;                 // Source builder: 'voice-builder', 'suno-builder', etc.
  createdAt: number;              // Timestamp
  metadata?: {
    voiceName?: string;
    genre?: string;
    mood?: string;
    script?: string;
    [key: string]: any;
  };
}

export interface AudioStoreContextType {
  // State
  assets: AudioAsset[];
  voiceAssets: AudioAsset[];
  musicAssets: AudioAsset[];

  // Actions
  addAsset: (asset: Omit<AudioAsset, 'id' | 'createdAt'>) => string;
  removeAsset: (id: string) => void;
  getAsset: (id: string) => AudioAsset | undefined;
  getLatestVoice: () => AudioAsset | undefined;
  getLatestMusic: () => AudioAsset | undefined;
  clearAssets: (type?: AudioAssetType) => void;

  // Cross-builder helpers
  importFromVoiceBuilder: (audioUrl: string, name: string, metadata?: AudioAsset['metadata']) => string;
  importFromMusicBuilder: (audioUrl: string, name: string, metadata?: AudioAsset['metadata']) => string;
  exportToVideoBuilder: (assetId: string) => AudioAsset | undefined;

  // Session storage sync
  saveToSession: () => void;
  loadFromSession: () => void;
}

const AudioStoreContext = createContext<AudioStoreContextType | undefined>(undefined);

// Session storage key
const SESSION_STORAGE_KEY = 'smartpromptiq_audio_store';

// Track blob URLs for cleanup
const blobUrlRegistry = new Set<string>();

// Helper to generate unique IDs
const generateId = () => `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to check if URL is a blob URL
const isBlobUrl = (url: string) => url.startsWith('blob:');

export function useAudioStore() {
  const context = useContext(AudioStoreContext);
  if (!context) {
    throw new Error('useAudioStore must be used within AudioStoreProvider');
  }
  return context;
}

// Safe hook that doesn't throw
export function useAudioStoreSafe() {
  return useContext(AudioStoreContext);
}

interface AudioStoreProviderProps {
  children: React.ReactNode;
}

export function AudioStoreProvider({ children }: AudioStoreProviderProps) {
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const voiceAssets = assets.filter(a => a.type === 'voice');
  const musicAssets = assets.filter(a => a.type === 'music' || a.type === 'background');

  // Load from session storage on mount
  useEffect(() => {
    loadFromSession();

    // Cleanup on unmount
    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
  }, []);

  // Save to session storage whenever assets change
  useEffect(() => {
    saveToSession();
  }, [assets]);

  // Cleanup old blob URLs periodically (every 5 minutes)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupOldBlobUrls();
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Cleanup blob URLs that are no longer in use
  const cleanupOldBlobUrls = useCallback(() => {
    const currentUrls = new Set(assets.map(a => a.url).filter(isBlobUrl));

    blobUrlRegistry.forEach(url => {
      if (!currentUrls.has(url)) {
        URL.revokeObjectURL(url);
        blobUrlRegistry.delete(url);
        console.log('Cleaned up unused blob URL');
      }
    });
  }, [assets]);

  // Save to session storage
  const saveToSession = useCallback(() => {
    try {
      // Only store non-blob URLs in session (blob URLs don't persist)
      const persistableAssets = assets.filter(a => !isBlobUrl(a.url));
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(persistableAssets));
    } catch (error) {
      console.warn('Failed to save audio store to session:', error);
    }
  }, [assets]);

  // Load from session storage
  const loadFromSession = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AudioAsset[];
        setAssets(parsed);
        console.log('Loaded', parsed.length, 'audio assets from session');
      }
    } catch (error) {
      console.warn('Failed to load audio store from session:', error);
    }
  }, []);

  // Add a new asset
  const addAsset = useCallback((asset: Omit<AudioAsset, 'id' | 'createdAt'>): string => {
    const id = generateId();
    const newAsset: AudioAsset = {
      ...asset,
      id,
      createdAt: Date.now(),
    };

    // Track blob URL for cleanup
    if (isBlobUrl(asset.url)) {
      blobUrlRegistry.add(asset.url);
    }

    setAssets(prev => [...prev, newAsset]);
    console.log(`Added audio asset: ${asset.name} (${asset.type}) from ${asset.source}`);

    return id;
  }, []);

  // Remove an asset
  const removeAsset = useCallback((id: string) => {
    setAssets(prev => {
      const asset = prev.find(a => a.id === id);
      if (asset && isBlobUrl(asset.url)) {
        URL.revokeObjectURL(asset.url);
        blobUrlRegistry.delete(asset.url);
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  // Get an asset by ID
  const getAsset = useCallback((id: string): AudioAsset | undefined => {
    return assets.find(a => a.id === id);
  }, [assets]);

  // Get the most recent voice asset
  const getLatestVoice = useCallback((): AudioAsset | undefined => {
    return voiceAssets.sort((a, b) => b.createdAt - a.createdAt)[0];
  }, [voiceAssets]);

  // Get the most recent music asset
  const getLatestMusic = useCallback((): AudioAsset | undefined => {
    return musicAssets.sort((a, b) => b.createdAt - a.createdAt)[0];
  }, [musicAssets]);

  // Clear assets (optionally by type)
  const clearAssets = useCallback((type?: AudioAssetType) => {
    setAssets(prev => {
      const toRemove = type ? prev.filter(a => a.type === type) : prev;

      // Cleanup blob URLs
      toRemove.forEach(asset => {
        if (isBlobUrl(asset.url)) {
          URL.revokeObjectURL(asset.url);
          blobUrlRegistry.delete(asset.url);
        }
      });

      return type ? prev.filter(a => a.type !== type) : [];
    });
  }, []);

  // Import from Voice Builder
  const importFromVoiceBuilder = useCallback((
    audioUrl: string,
    name: string,
    metadata?: AudioAsset['metadata']
  ): string => {
    return addAsset({
      type: 'voice',
      name,
      url: audioUrl,
      source: 'voice-builder',
      metadata,
    });
  }, [addAsset]);

  // Import from Music Builder (Suno, etc.)
  const importFromMusicBuilder = useCallback((
    audioUrl: string,
    name: string,
    metadata?: AudioAsset['metadata']
  ): string => {
    return addAsset({
      type: 'music',
      name,
      url: audioUrl,
      source: 'music-builder',
      metadata,
    });
  }, [addAsset]);

  // Export to Video Builder
  const exportToVideoBuilder = useCallback((assetId: string): AudioAsset | undefined => {
    const asset = getAsset(assetId);
    if (asset) {
      // Mark the asset as exported
      setAssets(prev => prev.map(a =>
        a.id === assetId
          ? { ...a, metadata: { ...a.metadata, exportedToVideo: true } }
          : a
      ));
    }
    return asset;
  }, [getAsset]);

  const value: AudioStoreContextType = {
    assets,
    voiceAssets,
    musicAssets,
    addAsset,
    removeAsset,
    getAsset,
    getLatestVoice,
    getLatestMusic,
    clearAssets,
    importFromVoiceBuilder,
    importFromMusicBuilder,
    exportToVideoBuilder,
    saveToSession,
    loadFromSession,
  };

  return (
    <AudioStoreContext.Provider value={value}>
      {children}
    </AudioStoreContext.Provider>
  );
}

export default AudioStoreProvider;
