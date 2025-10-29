import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
}) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Update refs
  useEffect(() => {
    minValRef.current = minVal;
    maxValRef.current = maxVal;
  }, [minVal, maxVal]);

  // Trigger onChange only when values actually change from user interaction
  const handleMinChange = (newMin: number) => {
    const validMin = Math.min(newMin, maxVal - step);
    setMinVal(validMin);
    onChange([validMin, maxVal]);
  };

  const handleMaxChange = (newMax: number) => {
    const validMax = Math.max(newMax, minVal + step);
    setMaxVal(validMax);
    onChange([minVal, validMax]);
  };

  return (
    <div className="dual-range-slider-container">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(event) => handleMinChange(Number(event.target.value))}
        className="dual-range-slider thumb-left"
        style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(event) => handleMaxChange(Number(event.target.value))}
        className="dual-range-slider thumb-right"
      />

      <div className="dual-range-slider-track">
        <div ref={range} className="dual-range-slider-range" />
      </div>
    </div>
  );
};
