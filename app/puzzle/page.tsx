'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SecretKey, encrypt, decrypt } from '@nillion/blindfold';
import examplePuzzleLink from './puzzle-link.json';

// Pre-encrypted puzzle data
const PUZZLE_DATA: Record<number, {
  clue: string;
  expectedSeed: string;
  message: string;
  nextClue: string | null;
  shares: any;
}> = {
  1: {
    clue: 'What color do you get when you mix red and blue?',
    expectedSeed: 'purple',
    message: 'Correct! Red + Blue = Purple',
    nextClue: 'The puzzle continues... What is 2 + 2?',
    shares: [], // Will be populated by generatePuzzleShares
  },
  2: {
    clue: 'What is 2 + 2?',
    expectedSeed: 'four',
    message: 'Well done! 2 + 2 = 4',
    nextClue: "Final question... What animal says 'meow'?",
    shares: [],
  },
  3: {
    clue: "What animal says 'meow'?",
    expectedSeed: 'cat',
    message: '🎉 Puzzle Complete! You solved all three questions!',
    nextClue: null,
    shares: [],
  },
};

async function generatePuzzleShares() {
  // Create cluster configuration for 3 nodes
  const cluster = { nodes: [{}, {}, {}] };

  for (const [step, data] of Object.entries(PUZZLE_DATA)) {
    const secretKey = await SecretKey.generate(
      cluster,
      { store: true },
      null,
      data.expectedSeed
    );

    const encrypted = await encrypt(secretKey, data.message);
    data.shares = encrypted;
  }
}

function PuzzlePage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [seed, setSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [puzzleInitialized, setPuzzleInitialized] = useState(false);
  const [isUrlPuzzle, setIsUrlPuzzle] = useState(false);
  const [urlShares, setUrlShares] = useState(null);
  const [urlQuestion, setUrlQuestion] = useState('');
  const [isUrlFinal, setIsUrlFinal] = useState(false);
  const [nextStepData, setNextStepData] = useState<any>(null);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const [isDecryptionProcessExpanded, setIsDecryptionProcessExpanded] =
    useState(false);

  // Initialize puzzle data - only for built-in puzzles (deprecated)
  useEffect(() => {
    const initPuzzle = async () => {
      // Only initialize if there are no URL params (legacy support)
      const hasUrlParams =
        searchParams.has('s') ||
        searchParams.has('shares') ||
        searchParams.has('q') ||
        searchParams.has('question');

      if (!hasUrlParams) {
        // No URL params - don't initialize built-in puzzles anymore
        setPuzzleInitialized(true);
        return;
      }

      // Legacy: initialize built-in puzzles if needed
      await generatePuzzleShares();
      setPuzzleInitialized(true);
    };
    initPuzzle();
  }, [searchParams]);

  // Check URL params for puzzle data
  useEffect(() => {
    const sharesParam = searchParams.get('s') || searchParams.get('shares');
    const questionParam = searchParams.get('q') || searchParams.get('question');
    const finalParam =
      searchParams.get('f') || searchParams.get('finalQuestion');
    const base64Param = searchParams.get('b64');

    console.log('🔍 URL params:', {
      sharesParam,
      questionParam,
      finalParam,
      base64Param,
    });

    if (sharesParam && questionParam) {
      // We have puzzle data from URL - this is a generated puzzle chain
      try {
        let sharesData;

        if (base64Param === '1') {
          // Decode from base64
          console.log('🔓 Decoding base64 shares...');
          const decoded = Buffer.from(sharesParam, 'base64').toString();
          sharesData = JSON.parse(decoded);
        } else {
          // Regular JSON parsing
          console.log('📝 Parsing JSON shares...');
          const decodedShares = decodeURIComponent(sharesParam);
          console.log('📝 Decoded shares string:', decodedShares);

          if (!decodedShares || decodedShares === 'undefined') {
            throw new Error('Shares parameter is undefined or empty');
          }

          sharesData = JSON.parse(decodedShares);
        }

        // Set up the puzzle with URL data
        const question = decodeURIComponent(questionParam);
        setIsUrlPuzzle(true);
        setUrlShares(sharesData);
        setUrlQuestion(question);
        setIsUrlFinal(finalParam === '1' || finalParam === 'true');

        console.log('📥 Loaded puzzle from URL:', {
          question,
          sharesCount: sharesData.length,
          isFinal: finalParam === '1' || finalParam === 'true',
        });
      } catch (error) {
        console.error('Failed to parse puzzle data from URL:', error);
        console.error('sharesParam was:', sharesParam);
        console.error('questionParam was:', questionParam);
        setError(`Invalid puzzle URL data: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else if (sharesParam || questionParam) {
      // Partial data - something is wrong
      console.error('❌ Incomplete puzzle URL data:', {
        sharesParam,
        questionParam,
      });
      setError('Incomplete puzzle URL - missing shares or question parameter');
    }
  }, [searchParams]);

  const handleDecrypt = async () => {
    if (!puzzleInitialized && !isUrlPuzzle) return;

    try {
      setError('');
      setIsLoading(true);
      setDecryptedMessage('');

      if (!seed.trim()) {
        setError('Please enter your answer');
        return;
      }

      // Create cluster configuration
      const cluster = { nodes: [{}, {}, {}] };

      // Generate key with the provided seed
      const key = await SecretKey.generate(
        cluster,
        { store: true },
        null,
        seed.toLowerCase().trim()
      );

      // Get shares to decrypt
      let sharesToDecrypt;
      if (isUrlPuzzle) {
        sharesToDecrypt = urlShares;
      } else {
        const puzzleStep = PUZZLE_DATA[currentStep];
        sharesToDecrypt = puzzleStep.shares;
      }

      // Try to decrypt
      const decrypted = await decrypt(key, sharesToDecrypt);
      const decryptedString = decrypted as string;
      setDecryptedMessage(decryptedString);

      // If this is a URL puzzle and not the final step, parse the next step data
      if (isUrlPuzzle && !isUrlFinal) {
        try {
          const parsedNextStepData = JSON.parse(decryptedString);
          console.log('📤 Next step data:', parsedNextStepData);

          // Validate the next step data
          if (!parsedNextStepData.s || !parsedNextStepData.q) {
            console.error('❌ Invalid next step data:', parsedNextStepData);
            setError('Invalid next step data received');
            return;
          }

          // Store the next step data to display instead of auto-redirecting
          setNextStepData(parsedNextStepData);
        } catch (e) {
          console.log('No next step data found, treating as completion:', e);
        }
      }
    } catch (err: any) {
      setError('Incorrect answer! Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildNextStepUrl = (stepData: any) => {
    const params = new URLSearchParams();
    params.set('s', stepData.s);
    params.set('q', stepData.q);
    if (stepData.f) params.set('f', '1');
    if (stepData.b64) params.set('b64', '1');

    return `/puzzle?${params.toString()}`;
  };

  const goToNextPuzzle = () => {
    if (nextStepData) {
      const nextUrl = buildNextStepUrl(nextStepData);
      console.log('🔄 Navigating to:', nextUrl);
      window.location.href = nextUrl;
    }
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const isJsonMessage = (message: string) => {
    try {
      JSON.parse(message);
      return true;
    } catch {
      return false;
    }
  };

  const formatJsonMessage = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return message;
    }
  };

  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= 3) {
      // Reset state for next step
      setSeed('');
      setDecryptedMessage('');
      setError('');
      setCurrentStep(nextStep);

      // Update URL
      window.history.pushState(null, '', `/puzzle?step=${nextStep}`);
    }
  };

  const resetPuzzle = () => {
    setSeed('');
    setDecryptedMessage('');
    setError('');
    setCurrentStep(1);
    window.history.pushState(null, '', '/puzzle');
  };

  if (!puzzleInitialized && !isUrlPuzzle) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-mono text-gray-400">
            Initializing puzzle...
          </div>
        </div>
      </div>
    );
  }

  // If no URL puzzle is loaded, show "coming soon" message
  if (!isUrlPuzzle) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto p-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 font-mono">
              🧩 BLINDFOLD PUZZLE
            </h1>
            <div className="text-lg text-gray-300 mb-6">
              Interactive Cryptographic Challenges
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="p-6 border border-gray-700 text-center mb-8">
            <div className="text-2xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-white mb-4 font-mono">
              NEXT PUZZLE COMING SOON
            </h2>
            <div className="text-gray-300 mb-6">
              Puzzles are chained collections of questions and answers secured
              with blindfold encryption. Each puzzle answer becomes the secret
              key that unlocks the next puzzle in the sequence, creating an
              interconnected cryptographic challenge.
            </div>
          </div>

          {/* Example Link */}
          <div className="p-4 border border-gray-700">
            <h3 className="font-mono text-white mb-3">
              🔗 TRY AN EXAMPLE PUZZLE
            </h3>
            <a
              href={examplePuzzleLink.url}
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 font-medium transition-colors font-mono text-sm"
            >
              🧩 TRY EXAMPLE PUZZLE
            </a>
          </div>

          {/* Detailed Chain Explanation */}
          <div className="mt-6 p-4 border border-gray-700">
            <h3 className="font-mono text-white mb-2">
              🔧 HOW PUZZLE CHAINS WORK
            </h3>
            <div className="text-xs text-gray-300 space-y-2">
              <div className="ml-2">
                • Each puzzle is encrypted with blindfold encryption
              </div>
              <div className="ml-2">
                • Your answer becomes the SecretKey to decrypt the next question
              </div>
              <div className="ml-2">
                • Example: "What's 2+2?" Answer "4" → SecretKey unlocks next
                puzzle
              </div>
              <div className="ml-2">
                • Wrong answer = wrong SecretKey = gibberish
              </div>
              <div className="ml-2">
                • Can't skip steps - you need the right SecretKey to get to the
                next puzzle
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine current puzzle data
  const currentPuzzle = isUrlPuzzle
    ? { clue: urlQuestion, shares: urlShares }
    : PUZZLE_DATA[currentStep];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">
            🧩 BLINDFOLD PUZZLE
          </h1>
          <div className="text-sm text-gray-400">
            {isUrlPuzzle
              ? isUrlFinal
                ? 'Final Challenge - Decrypt to complete!'
                : 'Cryptographic Chain Challenge'
              : `Step ${currentStep} of 3 - Answer the question to decrypt the message`}
          </div>
        </div>

        {/* Progress Bar - only show for built-in puzzles */}
        {!isUrlPuzzle && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-gray-400">{currentStep}/3</span>
            </div>
            <div className="w-full bg-gray-700 h-2">
              <div
                className="bg-green-600 h-2 transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Encrypted Shares Visualization */}
        <div className="p-4 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold mb-4 text-white font-mono">
            ENCRYPTED PUZZLE SHARES
          </h2>
          <div className="text-sm text-gray-400 mb-4">
            Puzzle secrets are encrypted and split across 3 nodes. Each correct
            answer is the SecretKey to decrypt the next puzzle clue:
          </div>

          {/* Visual node representation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
            {[0, 1, 2].map((nodeIndex) => (
              <div key={nodeIndex} className="relative">
                <div className="p-2">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400"></div>
                        <span className="text-white font-medium text-xs">
                          Node {nodeIndex + 1}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 min-h-[60px] flex items-center border border-gray-700">
                      <div className="w-full">
                        <textarea
                          readOnly
                          value={
                            puzzleInitialized && currentPuzzle.shares[nodeIndex]
                              ? typeof currentPuzzle.shares[nodeIndex] ===
                                'string'
                                ? currentPuzzle.shares[nodeIndex]
                                : JSON.stringify(
                                    currentPuzzle.shares[nodeIndex]
                                  )
                              : 'Loading...'
                          }
                          className="w-full bg-transparent text-green-400 font-mono text-xs break-all leading-tight min-h-[40px] max-h-20 overflow-y-auto resize-none border-none outline-none p-0"
                          onClick={(e) => e.currentTarget.select()}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection lines */}
                {nodeIndex < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-600 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-gray-400 mb-4">
            Secret message distributed across {3} nodes using XOR secret sharing
          </div>
        </div>

        {/* Question */}
        <div className="p-4 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold mb-4 text-white font-mono">
            PUZZLE CLUE:
          </h2>
          <div className="text-lg text-gray-300 mb-4">
            <strong>{currentPuzzle.clue}</strong>
          </div>

          {/* Answer Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300 font-mono">
              YOUR ANSWER
            </label>
            <div className="relative">
              <input
                type={showSeed ? 'text' : 'password'}
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full p-3 pr-10 text-sm border border-gray-600 bg-black text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all font-mono"
                placeholder="Enter your answer..."
                onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
              />
              <button
                type="button"
                onClick={() => setShowSeed(!showSeed)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showSeed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleDecrypt}
            disabled={isLoading || !seed.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 font-medium disabled:cursor-not-allowed transition-colors font-mono"
          >
            {isLoading ? 'CHECKING...' : 'SUBMIT ANSWER'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-600 text-red-400 px-4 py-3 mb-4">
            <div className="flex items-center">
              <span className="text-lg mr-2">❌</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {decryptedMessage && (
          <div className="p-4 border border-green-600 mb-6">
            <h3 className="text-lg font-bold mb-3 text-green-400 font-mono">
              ✅ DECRYPTION SUCCESSFUL!
            </h3>

            {/* Collapsible decryption process */}
            <div className="bg-gray-900 mb-4 border border-gray-600">
              {/* Header - always visible */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() =>
                  setIsDecryptionProcessExpanded(!isDecryptionProcessExpanded)
                }
              >
                <div className="text-xs text-gray-400 font-mono">
                  DECRYPTION PROCESS: Key used: "
                  <span className="text-yellow-400">
                    {seed.toLowerCase().trim()}
                  </span>
                  "
                </div>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  {isDecryptionProcessExpanded
                    ? '▼ Hide Details'
                    : '▶ Show Details'}
                </button>
              </div>

              {/* Expandable content */}
              {isDecryptionProcessExpanded && (
                <div className="border-t border-gray-700 p-3">
                  <div className="space-y-2 text-xs font-mono mb-4">
                    <div className="text-gray-300">
                      1. Key used: "
                      <span className="text-yellow-400">
                        {seed.toLowerCase().trim()}
                      </span>
                      "
                    </div>
                    <div className="text-gray-300">
                      2. Shares combined using XOR secret sharing
                    </div>
                    <div className="text-gray-300">
                      3. Message decrypted ({decryptedMessage.length} chars):
                    </div>
                  </div>

                  {/* Full message display */}
                  <div className="border border-gray-700 bg-black">
                    <div className="p-2 border-b border-gray-700">
                      <span className="text-xs text-gray-400">
                        {isJsonMessage(decryptedMessage)
                          ? 'JSON Data (Formatted)'
                          : 'Decrypted Message'}
                      </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      <textarea
                        readOnly
                        value={
                          isJsonMessage(decryptedMessage)
                            ? formatJsonMessage(decryptedMessage)
                            : decryptedMessage
                        }
                        className="w-full bg-transparent text-green-400 font-mono text-xs leading-tight resize-none border-none outline-none p-3"
                        style={{ minHeight: '100px' }}
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Next Step Data for URL Puzzles */}
            {isUrlPuzzle && nextStepData && !isUrlFinal && (
              <div className="border-t border-green-600 pt-4 mb-4">
                <div className="text-sm text-gray-300 mb-2">
                  🔗 <strong>Next Puzzle Unlocked:</strong>
                </div>

                {/* Next Shares Visualization */}
                <div className="bg-gray-900 p-3 mb-4 border border-gray-600">
                  <div className="text-xs text-gray-400 mb-2">
                    ENCRYPTED SHARES FOR NEXT PUZZLE:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(() => {
                      try {
                        let sharesData;
                        if (nextStepData.b64 === 1) {
                          const decoded = Buffer.from(
                            nextStepData.s,
                            'base64'
                          ).toString();
                          sharesData = JSON.parse(decoded);
                        } else {
                          sharesData = JSON.parse(
                            decodeURIComponent(nextStepData.s)
                          );
                        }

                        return sharesData.map((share: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="text-xs text-gray-400 w-12">
                              Node {index + 1}:
                            </div>
                            <div className="flex-1 bg-black p-2 border border-gray-700">
                              <textarea
                                readOnly
                                value={
                                  typeof share === 'string'
                                    ? share
                                    : JSON.stringify(share)
                                }
                                className="w-full bg-transparent text-green-400 font-mono text-xs break-all leading-tight min-h-[30px] max-h-16 overflow-y-auto resize-none border-none outline-none p-0"
                                onClick={(e) => e.currentTarget.select()}
                              />
                            </div>
                          </div>
                        ));
                      } catch (e) {
                        return (
                          <div className="text-red-400 text-xs">
                            Error parsing next step shares
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                <button
                  onClick={goToNextPuzzle}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 font-medium transition-colors font-mono"
                >
                  GO TO NEXT PUZZLE →
                </button>
              </div>
            )}

            {/* Next Step or Completion for Built-in Puzzles */}
            {!isUrlPuzzle && currentStep < 3 && 'nextClue' in currentPuzzle && currentPuzzle.nextClue && (
              <div className="border-t border-green-600 pt-4">
                <div className="text-sm text-gray-300 mb-2">
                  🔗 <strong>Chain of Puzzles:</strong>
                </div>
                <div className="bg-gray-900 p-3 mb-4 border border-gray-600">
                  <div className="text-xs text-gray-400 mb-2">
                    NEXT PUZZLE SETUP:
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="text-gray-300">
                      1. New message encrypted with different key
                    </div>
                    <div className="text-gray-300">
                      2. Distributed across 3 new nodes
                    </div>
                    <div className="text-gray-300">
                      3. Next challenge:{' '}
                      <span className="text-blue-400">
                        {'nextClue' in currentPuzzle ? currentPuzzle.nextClue : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={goToNextStep}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 font-medium transition-colors font-mono"
                >
                  LOAD NEXT PUZZLE (STEP {currentStep + 1}) →
                </button>
              </div>
            )}

            {/* Completion for URL Puzzles */}
            {isUrlPuzzle && isUrlFinal && !nextStepData && (
              <div className="border-t border-green-600 pt-4">
                <div className="text-center">
                  <div className="text-2xl mb-4">🏆</div>
                  <div className="text-green-300 mb-4">
                    {decryptedMessage.includes('🎉')
                      ? decryptedMessage
                      : `🎉 Puzzle Complete! ${decryptedMessage}`}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    You've successfully solved the cryptographic puzzle chain!
                  </div>
                  <div className="flex gap-4 justify-center">
                    <a
                      href="/puzzle"
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 font-medium transition-colors font-mono"
                    >
                      TRY ANOTHER PUZZLE
                    </a>
                    <a
                      href="/store"
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 font-medium transition-colors font-mono"
                    >
                      TRY ENCRYPTION
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Completion for Built-in Puzzles */}
            {!isUrlPuzzle && currentStep === 3 && (
              <div className="border-t border-green-600 pt-4">
                <div className="text-center">
                  <div className="text-2xl mb-4">🏆</div>
                  <div className="text-green-300 mb-4">
                    Congratulations! You've completed the Blindfold puzzle and
                    learned how encrypted data can only be decrypted with the
                    correct key.
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={resetPuzzle}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 font-medium transition-colors font-mono"
                    >
                      PLAY AGAIN
                    </button>
                    <a
                      href="/store"
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 font-medium transition-colors font-mono"
                    >
                      TRY ENCRYPTION
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 border border-gray-700">
          <h3 className="font-mono text-white mb-2">
            🔧 CRYPTOGRAPHIC PROCESS
          </h3>
          <div className="text-xs text-gray-300 space-y-2">
            <div className="ml-2">
              • Data split into encrypted shares across nodes
            </div>
            <div className="ml-2">
              • Your answer becomes the SecretKey to decrypt the next puzzle
            </div>
            <div className="ml-2">
              • Right answer = readable message, wrong answer = gibberish
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PuzzlePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-mono text-gray-400">
              Loading puzzle...
            </div>
          </div>
        </div>
      }
    >
      <PuzzlePage />
    </Suspense>
  );
}
