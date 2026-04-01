/**
 * RadarChartView - Radar chart display for model comparison
 * Uses recharts - this component is lazy loaded to reduce initial bundle
 */
import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ModelEntry } from './types';

type RadarChartViewProps = {
  models: ModelEntry[];
  selectedModels: string[];
};

export function RadarChartView({ models, selectedModels }: RadarChartViewProps) {
  const subjects = [
    { label: '推理能力', key: 'reasoning' as const },
    { label: '代码生成', key: 'coding' as const },
    { label: '多语言', key: 'multilingual' as const },
    { label: '响应速度', key: 'speed' as const },
    { label: '成本效益', key: 'cost' as const },
  ];

  const selectedModelData = useMemo(() => {
    const selected = models.filter((m) => selectedModels.includes(m.name));
    return subjects.map((subject) => {
      const row: Record<string, string | number> = { subject: subject.label };
      selected.forEach((model) => {
        row[model.name] = model.scores[subject.key];
      });
      return row;
    });
  }, [models, selectedModels]);

  const tooltipStyle = {
    backgroundColor: 'rgba(0,0,0,0.9)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
  };

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
      <h4 className="text-lg font-semibold mb-6 text-center">综合能力雷达图</h4>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={selectedModelData}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.6)" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
          <Tooltip contentStyle={tooltipStyle} />
          {selectedModels.map((name) => {
            const model = models.find((m) => m.name === name);
            if (!model) return null;
            return (
              <Radar
                key={model.name}
                name={model.name}
                dataKey={model.name}
                stroke={model.color}
                fill={model.color}
                fillOpacity={0.2}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {selectedModels.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: models.find((m) => m.name === name)?.color ?? '#ffffff',
              }}
            />
            <span className="text-sm text-white/60">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}