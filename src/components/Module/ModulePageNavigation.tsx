import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Lock } from 'lucide-react';
import { ModulePage } from '../../lib/supabase';

interface ModulePageNavigationProps {
  pages: ModulePage[];
  currentPageIndex: number;
  completedPages: Set<number>;
  onPageChange: (pageIndex: number) => void | Promise<void>;
  canAccessPage: (pageIndex: number) => boolean;
  onFinish?: () => void | Promise<void>;
}

export function ModulePageNavigation({
  pages,
  currentPageIndex,
  completedPages,
  onPageChange,
  canAccessPage,
  onFinish
}: ModulePageNavigationProps) {
  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      onPageChange(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1 && canAccessPage(currentPageIndex + 1)) {
      onPageChange(currentPageIndex + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Page {currentPageIndex + 1} sur {pages.length}
          </span>
          <span className="text-sm text-gray-500">
            {completedPages.size}/{pages.length} terminées
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedPages.size / pages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Page indicators */}
      <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-2">
        {pages.map((page, index) => {
          const isCompleted = completedPages.has(index);
          const isCurrent = index === currentPageIndex;
          const canAccess = canAccessPage(index);

          return (
            <button
              key={page.id || index}
              onClick={() => canAccess && onPageChange(index)}
              disabled={!canAccess}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                isCurrent
                  ? 'bg-gray-900 text-white ring-2 ring-gray-600'
                  : isCompleted
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : canAccess
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={`${page.title}${!canAccess ? ' (Verrouillée)' : ''}`}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : !canAccess ? (
                <Lock className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentPageIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {currentPageIndex === pages.length - 1 && onFinish ? (
          <button
            onClick={onFinish}
            className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700 font-medium"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Terminer</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentPageIndex === pages.length - 1 || !canAccessPage(currentPageIndex + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

    </div>
  );
}
