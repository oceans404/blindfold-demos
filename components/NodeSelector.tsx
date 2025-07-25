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
          className="w-full accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
        </div>
      </div>

      {showThreshold && nodeCount > 1 && setThreshold && (
        <div>
          <label className="block text-sm font-medium mb-2 text-white font-mono">
            THRESHOLD MIN: {threshold}
          </label>
          <input
            type="range"
            min="1"
            max={nodeCount}
            value={threshold || 1}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-green-600"
          />
          <div className="text-xs text-gray-400 mt-1 font-mono">
            min: 1, max: {nodeCount}
          </div>
        </div>
      )}
    </div>
  );
}
