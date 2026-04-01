/**
 * BarChartView - Bar chart display for model comparison
 * Uses recharts - this component is lazy loaded to reduce initial bundle
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Database, Globe } from 'lucide-react';
import type { ModelEntry } from './types';

type BarChartViewProps = {
  models: ModelEntry[];
};

export function BarChartView({ models }: BarChartViewProps) {
  const comparisonData = models.map((m) => ({
    name: m.name,
    参数量: m.params.valueB ?? 0,
    上下文: m.context.valueK ?? 0,
  }));

  const tooltipStyle = {
    backgroundColor: 'rgba(0,0,0,0.9)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
        <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-spacex-orange" />
          参数量对比 (B)
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="参数量" fill="#005288" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
        <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-spacex-orange" />
          上下文长度对比 (K tokens)
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="上下文" fill="#FF6B35" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}