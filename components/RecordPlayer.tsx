'use client';

import { useEffect, useState } from 'react';

interface RecordPlayerProps {
  isPlaying: boolean;
  hasRecord: boolean;
}

export default function RecordPlayer({ isPlaying, hasRecord }: RecordPlayerProps) {
  const [currentFrame, setCurrentFrame] = useState('/pixel/emptyrecordplayer.png');

  useEffect(() => {
    // No record → always empty
    if (!hasRecord) {
      setCurrentFrame('/pixel/emptyrecordplayer.png');
      return;
    }

    // Record present but paused
    if (!isPlaying) {
      setCurrentFrame('/pixel/recordplayer.png');
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        // Needle bob ONLY after spinning frame
        if (prev === '/pixel/recordplayerspin.png' && Math.random() < 0.30) {
          return '/pixel/recordplayeralt.png';
        }

        // Alternate spin frames
        return prev === '/pixel/recordplayer.png'
          ? '/pixel/recordplayerspin.png'
          : '/pixel/recordplayer.png';
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying, hasRecord]);

  return (
    <div className="relative w-64 h-64">
      <img
        src={currentFrame}
        alt="Record Player"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
