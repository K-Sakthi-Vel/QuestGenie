import React from 'react';
import QuizRenderer from './QuizRenderer';

export default function QuizArea({ useMockData }) {
  return (
    <div>
      <QuizRenderer useMockData={useMockData} />
    </div>
  );
}
