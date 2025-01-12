import React from 'react';

export const LoadingDots: React.FC = () => {
  return (
    <div className="flex space-x-1 items-center h-4">
      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
    </div>
  );
};