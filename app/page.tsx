'use client';

import { useState, useRef } from 'react';
import RecordPlayer from '@/components/RecordPlayer';
import FallingHearts from '@/components/FallingHearts';

interface Track {
  name: string;
  file: File;
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);            // tracks on the loose record
  const [queuedTracks, setQueuedTracks] = useState<Track[]>([]); // tracks currently playing
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [recordAvailable, setRecordAvailable] = useState(false);
  const [hasRecordOnPlayer, setHasRecordOnPlayer] = useState(false);
  const [isDraggingRecord, setIsDraggingRecord] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // ----------------------------------
  // Load folder → create a loose record
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

    setTimeout(() => {
      newTracks.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      );

      setTracks(newTracks);
      setRecordAvailable(true); // 🔑 does NOT affect current playback
    }, 300);
  };
  // ----------------------------------
  // Drag record → needle follows cursor
  // ----------------------------------
  const startDrag = (e: React.MouseEvent) => {
    if (!recordAvailable || !tracks.length) return;
    e.preventDefault();

    // Hide the record in the drop area
    setIsDraggingRecord(true);

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

      // Show record in drop area again
      setIsDraggingRecord(false);

      if (!playerRef.current) return;

      const rect = playerRef.current.getBoundingClientRect();
      const droppedOnPlayer =
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom;

      if (droppedOnPlayer) {
        setQueuedTracks(tracks);
        setCurrentTrackIndex(0);
        setRecordAvailable(false);
        setHasRecordOnPlayer(true);
        playTrack(tracks, 0);
      }
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', drop);
  };

  // ----------------------------------
  // Playback logic (player record only)
  // ----------------------------------
  const playTrack = (list: Track[], index: number) => {
    if (!audioRef.current || !list[index]) return;
    audioRef.current.src = URL.createObjectURL(list[index].file);
    audioRef.current.play();
    setIsPlaying(true);
    setCurrentTrackIndex(index);
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
    if (!queuedTracks.length) return;
    const nextIndex = (currentTrackIndex + 1) % queuedTracks.length;
    playTrack(queuedTracks, nextIndex);
  };

  const prev = () => {
    if (!queuedTracks.length) return;
    const prevIndex =
      (currentTrackIndex - 1 + queuedTracks.length) % queuedTracks.length;
    playTrack(queuedTracks, prevIndex);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-pink-100 gap-6 p-6">
      <FallingHearts active={isPlaying} />
      {/* Drop Area */}
      <div className="fixed top-4 left-4 z-20">
        <div
          onDrop={handleFileDrop}
          onDragOver={e => e.preventDefault()}
          className="
            w-40 h-40
            hover:w-64 hover:h-64
            border-2 border-dashed border-pink-500
            rounded-lg
            flex flex-col items-center justify-center

            transition-all duration-500 ease-out
            hover:scale-105
            hover:border-pink-600
            hover:shadow-lg hover:shadow-pink-300/40
          "
        >
          <h2 className="font-bold text-pink-700 text-sm hover:text-base transition-all">
            Load Records Here :)
          </h2>
          <p className="text-sm mt-2 text-pink-700">
            {recordAvailable &&
              `${tracks.length} track${tracks.length === 1 ? '' : 's'}`}
          </p>

          {recordAvailable && !isDraggingRecord && (
            <img
              src="/pixel/record.png"
              className="w-16 h-16 mt-4 cursor-pointer"
              onMouseDown={startDrag}
            />
          )}
        </div>
      </div>
      {/* Record Player */}
      <div ref={playerRef}>
        <RecordPlayer isPlaying={isPlaying} hasRecord={hasRecordOnPlayer} />
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

      <div className="fixed bottom-4 right-4 text-sm text-pink-700 opacity-80 select-none">
        To Hannah, from Jake ❤️
      </div>

      <audio ref={audioRef} onEnded={next} />
    </main>
  );
}
