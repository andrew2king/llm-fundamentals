/**
 * Type definitions for ModelComparison components
 */

export type ModelScore = {
  reasoning: number;
  coding: number;
  multilingual: number;
  speed: number;
  cost: number;
};

export type ModelEntry = {
  name: string;
  company: string;
  release: string;
  params: { display: string; valueB: number | null };
  context: { display: string; valueK: number | null };
  strengths: string[];
  weaknesses: string[];
  scores: ModelScore;
  color: string;
};

export type ModelData = {
  lastUpdated: string;
  source: string;
  models: ModelEntry[];
};