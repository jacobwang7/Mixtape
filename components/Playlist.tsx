'use client';

import { useState } from 'react';

interface Track {
  name: string;
  file: File;
}

interface PlaylistProps {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

export default function Playlist({ tracks, setTracks }: PlaylistProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'audio/mpeg');
    const newTracks = files.map(file => ({ name: file.name, file }));
    setTracks(prev => [...prev, ...newTracks]);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      className="border-2 border-dashed border-pink-500 p-6 rounded-lg w-64 h-64 flex flex-col items-center justify-center mb-4"
    >
      <p className="text-center mb-2">Drag & Drop MP3s here</p>
      <div className="flex flex-wrap gap-2">
        {tracks.map((track, idx) => (
          <img
            key={idx}
            src="/pixel/record.png"
            alt={track.name}
            className="w-12 h-12 cursor-grab"
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('trackIndex', idx.toString());
              // optional: show needle cursor while dragging
              const cursor = new Image();
              cursor.src = '/pixel/needle.png';
              e.dataTransfer.setDragImage(cursor, 16, 16);
            }}
          />
        ))}
      </div>
    </div>
  );
}
