/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CinematicBackground } from './components/CinematicBackground';
import { CinematicTopNav } from './components/CinematicTopNav';
import { BirthdayInitScreen } from './components/screens/BirthdayInitScreen';
import { IntroVideoScreen } from './components/screens/IntroVideoScreen';
import { MissionBriefingScreen } from './components/screens/MissionBriefingScreen';
import { DestinationScreen } from './components/screens/DestinationScreen';
import { ExplorationMapScreen } from './components/screens/ExplorationMapScreen';
import { CelebrationTransitionScreen } from './components/screens/CelebrationTransitionScreen';
import { BirthdayCakeScreen } from './components/screens/BirthdayCakeScreen';
import { DESTINATIONS, ORDERED_DESTINATION_IDS } from './data/destinations';
import { DestinationId, ScreenType, AdventureProgress } from './types/adventure';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  isDestinationUnlocked,
} from './utils/storage';
import { sounds } from './utils/audio';

export default function App() {
  const [progress, setProgress] = useState<AdventureProgress>(loadProgress);
  // Default opening flow always begins with initialization sequence
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('init');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | undefined>(undefined);

  // Keep persistence in sync whenever progress updates
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Stage 1 -> Stage 2 -> Stage 3: After initialization completes, start intro video
  const handleInitComplete = () => {
    setCurrentScreen('intro-video');
  };

  // Stage 3 -> Stage 4: After introductory video finishes, transition into birthday mission
  const handleVideoComplete = () => {
    // If returning user already completed some destinations, continue to current destination
    if (progress.completedDestinations.length > 0) {
      setCurrentScreen('destination');
    } else {
      setCurrentScreen('briefing');
    }
  };

  // Begin Mission from Briefing
  const handleBeginMission = () => {
    setProgress((prev) => ({
      ...prev,
      currentDestinationId: 'camera',
    }));
    setCurrentScreen('destination');
  };

  // Complete a destination
  const handleCompleteDestination = (destId: DestinationId) => {
    setProgress((prev) => {
      const alreadyCompleted = prev.completedDestinations.includes(destId);
      const updatedList = alreadyCompleted
        ? prev.completedDestinations
        : [...prev.completedDestinations, destId];

      const allNineCompleted = updatedList.length >= 9;
      const isMapUnlocked = prev.isMapUnlocked || allNineCompleted;

      return {
        ...prev,
        completedDestinations: updatedList,
        isMapUnlocked,
      };
    });
  };

  // Advance to next destination
  const handleContinueNext = () => {
    const currentIndex = ORDERED_DESTINATION_IDS.indexOf(progress.currentDestinationId);

    // If just completed Friendship (the 9th and final destination)
    if (progress.currentDestinationId === 'friendship') {
      sounds.playCelebration();
      setProgress((prev) => ({
        ...prev,
        hasVisitedCelebration: true,
      }));
      setCurrentScreen('birthday-cake');
      return;
    }

    if (currentIndex >= 0 && currentIndex < ORDERED_DESTINATION_IDS.length - 1) {
      const nextId = ORDERED_DESTINATION_IDS[currentIndex + 1];
      setProgress((prev) => ({
        ...prev,
        currentDestinationId: nextId,
      }));
      setCurrentScreen('destination');
    } else {
      setCurrentScreen('exploration-map');
    }
  };

  // Direct destination select
  const handleSelectDestination = (destId: DestinationId) => {
    const unlocked = isDestinationUnlocked(
      destId,
      progress.completedDestinations,
      ORDERED_DESTINATION_IDS,
      progress.isMapUnlocked
    );

    if (unlocked) {
      setProgress((prev) => ({
        ...prev,
        currentDestinationId: destId,
      }));
      setCurrentScreen('destination');
    }
  };

  // Back navigation
  const handleNavigateBack = () => {
    if (currentScreen === 'destination') {
      if (progress.isMapUnlocked) {
        setCurrentScreen('exploration-map');
      } else {
        const currentIndex = ORDERED_DESTINATION_IDS.indexOf(progress.currentDestinationId);
        if (currentIndex > 0) {
          const prevId = ORDERED_DESTINATION_IDS[currentIndex - 1];
          setProgress((prev) => ({
            ...prev,
            currentDestinationId: prevId,
          }));
        } else {
          setCurrentScreen('briefing');
        }
      }
    } else if (currentScreen === 'exploration-map') {
      setCurrentScreen('destination');
    } else if (currentScreen === 'birthday-cake') {
      setCurrentScreen('exploration-map');
    }
  };

  // Open Planetary Map
  const handleOpenMap = () => {
    if (progress.isMapUnlocked) {
      setCurrentScreen('exploration-map');
    }
  };

  // Replay Introductory Video
  const handleReplayVideo = () => {
    setCurrentScreen('intro-video');
  };

  // Reset Progress
  const handleResetProgress = () => {
    const initial = resetProgress();
    setProgress(initial);
    setCurrentScreen('init');
  };

  // Transition to Celebration
  const handleContinueToCelebration = () => {
    setProgress((prev) => ({
      ...prev,
      hasVisitedCelebration: true,
    }));
    setCurrentScreen('birthday-cake');
  };

  // Enter Cake Screen
  const handleEnterCelebration = () => {
    setProgress((prev) => ({
      ...prev,
      hasVisitedCelebration: true,
    }));
    setCurrentScreen('birthday-cake');
  };

  const currentDestinationConfig =
    DESTINATIONS.find((d) => d.id === progress.currentDestinationId) || DESTINATIONS[0];

  const currentDestIndex = ORDERED_DESTINATION_IDS.indexOf(progress.currentDestinationId);
  const nextDestName =
    currentDestIndex < ORDERED_DESTINATION_IDS.length - 1
      ? DESTINATIONS[currentDestIndex + 1]?.name
      : undefined;

  const isFinalDestination = progress.currentDestinationId === 'friendship';
  const isCurrentCompleted = progress.completedDestinations.includes(progress.currentDestinationId);

  const backgroundMood =
    currentScreen === 'birthday-cake' || currentScreen === 'celebration-transition'
      ? 'celebration'
      : 'alien-planet';

  // Do not show top nav during initialization or during introductory video
  const showTopNav = currentScreen !== 'init' && currentScreen !== 'intro-video';

  return (
    <div className="relative min-h-screen w-full bg-[#040811] text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Procedural Canvas Ambient Starfield Backdrop */}
      {currentScreen !== 'intro-video' && (
        <CinematicBackground mood={backgroundMood} />
      )}

      {/* Clean Edge-to-Edge Cinematic Header (NO fake phone, NO 2/9 progress bar) */}
      {showTopNav && (
        <CinematicTopNav
          currentScreen={currentScreen}
          currentDestination={currentDestinationConfig}
          onNavigateBack={handleNavigateBack}
          onReplayVideo={handleReplayVideo}
          onOpenMap={handleOpenMap}
          onResetProgress={handleResetProgress}
          isMapUnlocked={progress.isMapUnlocked}
        />
      )}

      {/* Main Viewport Content - Full Width & Height */}
      <main className="relative flex-1 w-full flex flex-col z-10">
        {currentScreen === 'init' && (
          <BirthdayInitScreen onComplete={handleInitComplete} />
        )}

        {currentScreen === 'intro-video' && (
          <IntroVideoScreen
            onVideoComplete={handleVideoComplete}
            customVideoUrl={customVideoUrl}
            onSetCustomVideoUrl={setCustomVideoUrl}
          />
        )}

        {currentScreen === 'briefing' && (
          <div className="w-full flex-1 max-w-2xl mx-auto flex flex-col justify-center">
            <MissionBriefingScreen onBeginMission={handleBeginMission} />
          </div>
        )}

        {currentScreen === 'destination' && (
          <div
            className={
              currentDestinationConfig.id === 'camera' ||
              currentDestinationConfig.id === 'amazon' ||
              currentDestinationConfig.id === 'canva' ||
              currentDestinationConfig.id === 'youtube' ||
              currentDestinationConfig.id === 'music' ||
              currentDestinationConfig.id === 'paytm' ||
              currentDestinationConfig.id === 'zoo-park' ||
              currentDestinationConfig.id === 'google-maps' ||
              currentDestinationConfig.id === 'friendship'
                ? 'w-full flex-1 flex flex-col'
                : 'w-full flex-1 max-w-2xl mx-auto flex flex-col justify-center'
            }
          >
            <DestinationScreen
              key={currentDestinationConfig.id}
              destination={currentDestinationConfig}
              isCompleted={isCurrentCompleted}
              onCompleteDestination={handleCompleteDestination}
              onContinueNext={handleContinueNext}
              nextDestinationName={nextDestName}
              isFinalDestination={isFinalDestination}
            />
          </div>
        )}

        {currentScreen === 'exploration-map' && (
          <div className="w-full flex-1 max-w-7xl mx-auto flex flex-col">
            <ExplorationMapScreen
              destinations={DESTINATIONS}
              completedIds={progress.completedDestinations}
              onSelectDestination={handleSelectDestination}
              onContinueToCelebration={handleContinueToCelebration}
            />
          </div>
        )}

        {currentScreen === 'celebration-transition' && (
          <div className="w-full flex-1 max-w-2xl mx-auto flex flex-col justify-center">
            <CelebrationTransitionScreen onEnterCelebration={handleEnterCelebration} />
          </div>
        )}

        {currentScreen === 'birthday-cake' && (
          <div className="w-full flex-1 flex flex-col">
            <BirthdayCakeScreen
              onReturnToMap={() => setCurrentScreen('exploration-map')}
              onRestartAdventure={handleResetProgress}
            />
          </div>
        )}
      </main>
    </div>
  );
}
