import React, { Suspense } from 'react';
import SetGoalClient from './SetGoalClient';

export default function SetGoalPage() {
  return (
    <main>
      <h1 className="sr-only">Set Goal</h1>
      <Suspense fallback={<div>Loading goal UI…</div>}>
        <SetGoalClient />
      </Suspense>
    </main>
  );
}