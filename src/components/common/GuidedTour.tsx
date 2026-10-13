import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Compass
} from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector to highlight (e.g. '#tour-metrics')
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  badge?: string;
  icon?: React.ReactNode;
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string;
  tourName?: string;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  isOpen,
  onClose,
  storageKey,
  tourName = 'Tutorial'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Mark tour as completed in localStorage
  const markAsCompleted = useCallback(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, 'true');
      } catch (e) {
        console.error('Failed to set localStorage for tour:', e);
      }
    }
  }, [storageKey]);

  const handleFinish = useCallback(() => {
    markAsCompleted();
    onClose();
  }, [markAsCompleted, onClose]);

  const handleSkip = useCallback(() => {
    markAsCompleted();
    onClose();
  }, [markAsCompleted, onClose]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    }
  }, [isLastStep, handleFinish, steps.length]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    }
  }, [isFirstStep]);

  // Keyboard navigation support: Escape, ArrowRight, ArrowLeft, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  // Reset to step 0 when reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Calculate target position and spotlight bounds
  const updatePositions = useCallback(() => {
    if (!isOpen || !currentStep) return;

    if (!currentStep.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const targetEl = document.querySelector(currentStep.targetSelector);
    if (!targetEl) {
      setSpotlightRect(null);
      return;
    }

    // Scroll smoothly into view
    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });

    const rect = targetEl.getBoundingClientRect();
    const padding = 10;

    const computedSpotlight: SpotlightRect = {
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    };

    setSpotlightRect(computedSpotlight);

    // Calculate tooltip coordinates
    const cardEl = cardRef.current;
    const cardWidth = cardEl ? cardEl.offsetWidth : 400;
    const cardHeight = cardEl ? cardEl.offsetHeight : 230;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let targetTop = 0;
    let targetLeft = 0;

    const isMobile = viewportWidth < 640;
    if (isMobile) {
      // Ergonomic bottom anchor on mobile screens
      targetLeft = Math.max(12, (viewportWidth - cardWidth) / 2);
      targetTop = viewportHeight - cardHeight - 16;
    } else {
      const placement = currentStep.placement || 'bottom';

      if (placement === 'bottom') {
        targetTop = rect.bottom + 16;
        targetLeft = rect.left + rect.width / 2 - cardWidth / 2;
      } else if (placement === 'top') {
        targetTop = rect.top - cardHeight - 16;
        targetLeft = rect.left + rect.width / 2 - cardWidth / 2;
      } else if (placement === 'left') {
        targetTop = rect.top + rect.height / 2 - cardHeight / 2;
        targetLeft = rect.left - cardWidth - 16;
      } else if (placement === 'right') {
        targetTop = rect.top + rect.height / 2 - cardHeight / 2;
        targetLeft = rect.right + 16;
      } else {
        // center
        targetTop = (viewportHeight - cardHeight) / 2;
        targetLeft = (viewportWidth - cardWidth) / 2;
      }

      // Viewport overflow boundary protection
      targetLeft = Math.max(16, Math.min(viewportWidth - cardWidth - 16, targetLeft));
      targetTop = Math.max(16, Math.min(viewportHeight - cardHeight - 16, targetTop));
    }

    setTooltipPos({ top: targetTop, left: targetLeft });
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(updatePositions, 60);

    const handleResize = () => updatePositions();
    const handleScroll = () => updatePositions();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, currentStepIndex, updatePositions]);

  if (!isOpen || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* 1. Backdrop / SVG Cutout Mask Layer */}
      {spotlightRect ? (
        <>
          {/* SVG Mask Cutout */}
          <svg className="fixed inset-0 w-full h-full pointer-events-none z-30 transition-all duration-300">
            <defs>
              <mask id="tour-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="14"
                  ry="14"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(15, 23, 42, 0.78)"
              mask="url(#tour-spotlight-mask)"
            />
          </svg>

          {/* Glowing illuminated halo (ring and pulse animation) with precision outline */}
          <div
            className="fixed pointer-events-none transition-all duration-300 ease-out z-35 rounded-2xl"
            style={{
              top: `${spotlightRect.top}px`,
              left: `${spotlightRect.left}px`,
              width: `${spotlightRect.width}px`,
              height: `${spotlightRect.height}px`,
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.95), 0 0 24px rgba(59, 130, 246, 0.5)'
            }}
          >
            {/* Animated pulsing marker */}
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-xs" />
            </span>
          </div>
        </>
      ) : (
        /* Dark backdrop for centered or non-targeted steps */
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity z-30"
          onClick={handleSkip}
        />
      )}

      {/* 2. Smart Floating Card */}
      <div
        ref={cardRef}
        className={`fixed z-40 transition-all duration-300 ease-out max-sm:bottom-4 max-sm:inset-x-3 max-sm:top-auto! max-sm:w-auto! max-sm:max-w-none! ${
          !spotlightRect
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : ''
        }`}
        style={
          spotlightRect
            ? {
                top: `${tooltipPos.top}px`,
                left: `${tooltipPos.left}px`,
                maxWidth: 'calc(100vw - 32px)',
                width: '420px'
              }
            : {
                maxWidth: 'calc(100vw - 32px)',
                width: '460px'
              }
        }
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-800">
          
          {/* Card Header with Progress Badge and Skip */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-5 py-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">
                  {tourName}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Paso {currentStepIndex + 1} de {steps.length}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar / Saltar tutorial (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 h-1">
            <div
              className="bg-blue-600 h-1 transition-all duration-300 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`
              }}
            />
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                {currentStep.icon || <Sparkles className="w-4 h-4" />}
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {currentStep.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* Step Dots Indicators */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-6 bg-blue-600'
                      : idx < currentStepIndex
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Ir al paso ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Card Footer: Navigation Buttons */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors cursor-pointer"
            >
              Saltar
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isLastStep ? 'Finalizar' : 'Siguiente'}</span>
                {isLastStep ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
