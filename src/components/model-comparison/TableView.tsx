/**
 * TableView - Table display for model comparison
 * No recharts dependency - lightweight component
 */
import type { ModelEntry } from './types';

type TableViewProps = {
  models: ModelEntry[];
  selectedModels: string[];
};

export function TableView({ models, selectedModels }: TableViewProps) {
  const filteredModels = models.filter(
    (m) => selectedModels.length === 0 || selectedModels.includes(m.name)
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4 text-white/60 font-medium">模型</th>
            <th className="text-left py-4 px-4 text-white/60 font-medium">参数量</th>
            <th className="text-left py-4 px-4 text-white/60 font-medium">上下文</th>
            <th className="text-left py-4 px-4 text-white/60 font-medium">发布</th>
            <th className="text-left py-4 px-4 text-white/60 font-medium">优势</th>
            <th className="text-left py-4 px-4 text-white/60 font-medium">劣势</th>
          </tr>
        </thead>
        <tbody>
          {filteredModels.map((model) => (
            <tr
              key={model.name}
              className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
            >
              <td className="py-4 px-4">
                <div className="font-semibold">{model.name}</div>
                <div className="text-sm text-white/40">{model.company}</div>
              </td>
              <td className="py-4 px-4 font-mono">{model.params.display}</td>
              <td className="py-4 px-4 font-mono">{model.context.display}</td>
              <td className="py-4 px-4">{model.release}</td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1">
                  {model.strengths.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1">
                  {model.weaknesses.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}