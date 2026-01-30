'use client';

import { useState, useRef } from 'react';
import RecordPlayer from '@/components/RecordPlayer';
import FallingHearts from '@/components/FallingHearts';

interface Track {
  name: string;
  file: File;
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecordOnPlayer, setHasRecordOnPlayer] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const needleRef = useRef<HTMLImageElement | null>(null);
  const recordRef = useRef<HTMLImageElement | null>(null);

  // ----------------------------------
  // Folder + MP3 ingestion
  // ----------------------------------
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    const newTracks: Track[] = [];

    const traverse = async (entry: any) => {
      if (entry.isFile) {
        entry.file((file: File) => {
          if (file.type === 'audio/mpeg') {
            newTracks.push({ name: file.name, file });
          }
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        reader.readEntries(async (entries: any[]) => {
          for (const ent of entries) await traverse(ent);
        });
      }
    };

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) await traverse(entry);
    }

    setTimeout(() => setTracks(prev => [...prev, ...newTracks]), 500);
  };

  // ----------------------------------
  // Drag record → needle follows cursor
  // ----------------------------------
  const startDrag = (e: React.MouseEvent) => {
    if (!tracks.length) return;
    e.preventDefault();

    // Needle
    const needle = document.createElement('img');
    needle.src = '/pixel/needle.png';
    Object.assign(needle.style, {
      position: 'absolute',
      width: '32px',
      height: '32px',
      pointerEvents: 'none',
      zIndex: '9999',
    });
    document.body.appendChild(needle);
    needleRef.current = needle;

    // Record
    const record = document.createElement('img');
    record.src = '/pixel/record.png';
    Object.assign(record.style, {
      position: 'absolute',
      width: '48px',
      height: '48px',
      pointerEvents: 'none',
      zIndex: '9998',
    });
    document.body.appendChild(record);
    recordRef.current = record;

    const move = (ev: MouseEvent) => {
      needle.style.left = ev.pageX + 8 + 'px';
      needle.style.top = ev.pageY + 8 + 'px';
      record.style.left = ev.pageX - 24 + 'px';
      record.style.top = ev.pageY - 24 + 'px';
    };

    const drop = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', drop);
      needle.remove();
      record.remove();

      if (!playerRef.current) return;

      const rect = playerRef.current.getBoundingClientRect();
      const droppedOnPlayer =
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom;

      if (droppedOnPlayer) {
        setHasRecordOnPlayer(true);
        playTrack(0);
      }
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', drop);
  };

  // ----------------------------------
  // Playback logic
  // ----------------------------------
  const playTrack = (index: number) => {
    if (!tracks[index] || !audioRef.current) return;
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    audioRef.current.src = URL.createObjectURL(tracks[index].file);
    audioRef.current.play();
  };

  const togglePlay = () => {
    if (!audioRef.current || !hasRecordOnPlayer) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const next = () => {
    if (!tracks.length || currentTrackIndex === null) return;
    playTrack((currentTrackIndex + 1) % tracks.length);
  };

  const prev = () => {
    if (!tracks.length || currentTrackIndex === null) return;
    playTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-pink-100 gap-6 p-6">
      
      <FallingHearts active={isPlaying} />
      <div className="relative z-10">
        {/* record player + controls */}
      </div>
      
      {/* Playlist */}
      <div
        onDrop={handleFileDrop}
        onDragOver={e => e.preventDefault()}
        className="w-64 h-64 border-2 border-dashed border-pink-500 rounded-lg flex flex-col items-center justify-center"
      >
        <h2 className="font-bold text-pink-700">Place Record Here :)</h2>
        <p className="text-sm text-center mt-2">Drop MP3 folder here</p>
        <p className="mt-2 text-sm">{tracks.length} track(s)</p>

        {tracks.length > 0 && (
          <img
            src="/pixel/record.png"
            className="w-16 h-16 mt-4 cursor-pointer"
            onMouseDown={startDrag}
          />
        )}
      </div>

      {/* Player */}
      <div ref={playerRef}>
        <RecordPlayer
          isPlaying={isPlaying}
          hasRecord={hasRecordOnPlayer}
        />
      </div>

      {/* Controls */}
      {hasRecordOnPlayer && (
      <div className="flex gap-4 mt-4">
      <button
        onClick={prev}
        className="px-4 py-2 text-lg bg-pink-100 rounded shadow hover:bg-white"
      >
        ⏮
      </button>

      <button
      onClick={togglePlay}
      className="px-6 py-3 text-xl bg-pink-100 text-white rounded shadow hover:bg-white"
      >
        {isPlaying ? '⏸' : '▶️'}
      </button>

      <button
        onClick={next}
        className="px-4 py-2 text-lg bg-pink-100 rounded shadow hover:bg-white"
      >
        ⏭
      </button>
      </div>
      )}

      <audio ref={audioRef} onEnded={next} />
    </main>
  );
}
