'use client';

import { useEffect, useState } from 'react';

interface Props {
  isPlaying: boolean;
  hasRecord: boolean;
}

export default function RecordPlayer({ isPlaying, hasRecord }: Props) {
  const [frame, setFrame] = useState('/pixel/emptyrecordplayer.png');

  useEffect(() => {
    if (!hasRecord) {
      setFrame('/pixel/emptyrecordplayer.png');
      return;
    }

    if (!isPlaying) {
      setFrame('/pixel/recordplayer.png');
      return;
    }

    const interval = setInterval(() => {
      setFrame(prev => {
        const rand = Math.random();

        if (prev === '/pixel/recordplayerspin.png' && rand < 0.37) {
          return '/pixel/recordplayeralt.png';
        }

        return prev === '/pixel/recordplayer.png'
          ? '/pixel/recordplayerspin.png'
          : '/pixel/recordplayer.png';
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying, hasRecord]);

  return (
    <div className="relative w-64 h-64">
      <img src={frame} className="w-full h-full" />
    </div>
  );
}