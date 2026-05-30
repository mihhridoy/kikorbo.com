export type Lang = 'bn' | 'en';

// Flat key dictionary. Add a key to BOTH bn and en.
export type Dict = Record<string, string>;

// Each area module exports { bn, en }.
export interface AreaDict {
  bn: Dict;
  en: Dict;
}
