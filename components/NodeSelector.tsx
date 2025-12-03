'use client';

interface NodeSelectorProps {
  nodeCount: number;
  setNodeCount: (count: number) => void;
  threshold?: number;
  setThreshold?: (threshold: number) => void;
  showThreshold?: boolean;
}

export default function NodeSelector({
  nodeCount,
  setNodeCount,
  threshold,
  setThreshold,
  showThreshold = false,
}: NodeSelectorProps) {
  return (
    <div className="border border-gray-700 p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-white font-mono">
          NODE COUNT: {nodeCount}
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={nodeCount}
          onChange={(e) => setNodeCount(Number(e.target.value))}
          className="w-full accent-green-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono cursor-pointer">
          {Array.from({ length: 8 }, (_, i) => (
          <span onClick={() => setNodeCount(i+1)} key={i + 1}>{i + 1}</span>
          ))}
        </div>
      </div>

      {showThreshold && nodeCount > 1 && setThreshold && (
        <div>
          <label className="block text-sm font-medium mb-2 text-white font-mono">
            THRESHOLD MIN: {threshold}
          </label>
          <input
            type="range"
            min="2"
            max={nodeCount}
            value={threshold || 1}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono cursor-pointer">
            {Array.from({ length: Math.max(0, nodeCount - 1) }, (_, i) => {
              const val = i + 2;
              return (
                <span onClick={() => setThreshold(val)} key={val}>
                  {val}
                </span>
              );
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1 font-mono">
            min: 2, max: {nodeCount}
          </div>
        </div>
      )}
    </div>
  );
}
