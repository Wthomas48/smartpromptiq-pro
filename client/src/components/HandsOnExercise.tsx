import React, { useState } from 'react';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';

interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  hint?: string;
  solution?: string;
  checkpoints?: {
    label: string;
    points: number;
  }[];
}

interface HandsOnExerciseProps {
  exercise: Exercise;
  onComplete?: (completed: boolean) => void;
}

const HandsOnExercise: React.FC<HandsOnExerciseProps> = ({ exercise, onComplete }) => {
  const [userWork, setUserWork] = useState('');
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { playSound } = useAudioFeedback();

  const handleCheckpoint = (idx: number) => {
    if (completedCheckpoints.includes(idx)) {
      setCompletedCheckpoints(completedCheckpoints.filter(i => i !== idx));
    } else {
      setCompletedCheckpoints([...completedCheckpoints, idx]);
      playSound('success'); // Play success sound when checking off a checkpoint
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    playSound('achievement'); // Play achievement sound on submission
    if (onComplete) {
      const allComplete = exercise.checkpoints
        ? completedCheckpoints.length === exercise.checkpoints.length
        : userWork.trim().length > 0;
      onComplete(allComplete);
    }
  };

  const getProgress = () => {
    if (!exercise.checkpoints) return 0;
    return Math.round((completedCheckpoints.length / exercise.checkpoints.length) * 100);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl p-8 border-4 border-orange-100">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
              <i className="fas fa-hands text-orange-600 mr-2"></i>
              {exercise.title}
            </h3>
            <p className="text-gray-700 text-lg">{exercise.description}</p>
          </div>
          {exercise.checkpoints && (
            <div className="ml-4">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#fed7aa"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#ea580c"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - getProgress() / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-orange-600">{getProgress()}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h4 className="font-bold text-gray-900 mb-3 text-lg">
            <i className="fas fa-list-ol text-orange-600 mr-2"></i>
            Instructions
          </h4>
          <ol className="space-y-2">
            {exercise.instructions.map((instruction, idx) => (
              <li key={idx} className="flex items-start">
                <span className="inline-block w-7 h-7 bg-orange-500 text-white rounded-full text-center leading-7 mr-3 font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-gray-700 pt-1">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Checkpoints */}
        {exercise.checkpoints && exercise.checkpoints.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6">
            <h4 className="font-bold text-gray-900 mb-3 text-lg">
              <i className="fas fa-tasks text-orange-600 mr-2"></i>
              Checkpoints
            </h4>
            <div className="space-y-2">
              {exercise.checkpoints.map((checkpoint, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                    completedCheckpoints.includes(idx)
                      ? 'bg-green-50 border-2 border-green-300'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedCheckpoints.includes(idx)}
                    onChange={() => handleCheckpoint(idx)}
                    className="w-6 h-6 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className={`ml-3 flex-1 font-medium ${
                    completedCheckpoints.includes(idx) ? 'text-green-900 line-through' : 'text-gray-700'
                  }`}>
                    {checkpoint.label}
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                    {checkpoint.points} pts
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Work Area */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h4 className="font-bold text-gray-900 mb-3 text-lg">
            <i className="fas fa-pencil-alt text-orange-600 mr-2"></i>
            Your Work
          </h4>
          <textarea
            value={userWork}
            onChange={(e) => setUserWork(e.target.value)}
            placeholder="Document your work, paste your prompts, or write your solutions here..."
            rows={10}
            className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 font-mono text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">
              {userWork.length} characters
            </span>
            {userWork.length > 100 && (
              <span className="text-sm text-green-600 font-medium">
                <i className="fas fa-check-circle mr-1"></i>
                Great work!
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 mb-6">
          {exercise.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-6 py-3 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 rounded-xl font-bold hover:bg-yellow-200 transition-all"
            >
              <i className="fas fa-lightbulb mr-2"></i>
              {showHint ? 'Hide' : 'Show'} Hint
            </button>
          )}
          {exercise.solution && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-6 py-3 bg-purple-100 border-2 border-purple-300 text-purple-800 rounded-xl font-bold hover:bg-purple-200 transition-all"
            >
              <i className="fas fa-key mr-2"></i>
              {showSolution ? 'Hide' : 'Show'} Solution
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!userWork.trim() && completedCheckpoints.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <i className="fas fa-check-circle mr-2"></i>
            Submit Exercise
          </button>
        </div>

        {/* Hint */}
        {showHint && exercise.hint && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <i className="fas fa-lightbulb text-yellow-600 text-2xl mt-1"></i>
              <div>
                <h5 className="font-bold text-yellow-900 mb-2">Hint</h5>
                <p className="text-yellow-800">{exercise.hint}</p>
              </div>
            </div>
          </div>
        )}

        {/* Solution */}
        {showSolution && exercise.solution && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <i className="fas fa-key text-purple-600 text-2xl mt-1"></i>
              <div className="flex-1">
                <h5 className="font-bold text-purple-900 mb-2">Solution</h5>
                <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm whitespace-pre-wrap">
                  {exercise.solution}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <div>
                <h5 className="font-bold text-green-900 text-lg">Exercise Submitted!</h5>
                <p className="text-green-700">
                  Great job completing this exercise. Keep practicing to master these skills!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandsOnExercise;
