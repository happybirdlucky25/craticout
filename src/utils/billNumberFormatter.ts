// 🏛️ Bill Number Normalization and Formatting Utilities
// Handles conversion between LegiScan format (stored) and Federal format (displayed)

export interface BillNumberMapping {
  legiscanPattern: RegExp;
  federalFormat: (number: string) => string;
  legiscanFormat: (number: string) => string;
}

// Comprehensive mapping of bill types
const BILL_TYPE_MAPPINGS: BillNumberMapping[] = [
  // House Bills
  {
    legiscanPattern: /^HB\s*(\d+)$/i,
    federalFormat: (num) => `H.R. ${num}`,
    legiscanFormat: (num) => `HB${num}`
  },
  
  // Senate Bills
  {
    legiscanPattern: /^SB\s*(\d+)$/i,
    federalFormat: (num) => `S. ${num}`,
    legiscanFormat: (num) => `SB${num}`
  },
  
  // House Resolutions
  {
    legiscanPattern: /^HR\s*(\d+)$/i,
    federalFormat: (num) => `H.Res. ${num}`,
    legiscanFormat: (num) => `HR${num}`
  },
  
  // Senate Resolutions
  {
    legiscanPattern: /^SR\s*(\d+)$/i,
    federalFormat: (num) => `S.Res. ${num}`,
    legiscanFormat: (num) => `SR${num}`
  },
  
  // House Joint Resolutions
  {
    legiscanPattern: /^HJR\s*(\d+)$/i,
    federalFormat: (num) => `H.J.Res. ${num}`,
    legiscanFormat: (num) => `HJR${num}`
  },
  
  // Senate Joint Resolutions
  {
    legiscanPattern: /^SJR\s*(\d+)$/i,
    federalFormat: (num) => `S.J.Res. ${num}`,
    legiscanFormat: (num) => `SJR${num}`
  },
  
  // House Concurrent Resolutions
  {
    legiscanPattern: /^HCR\s*(\d+)$/i,
    federalFormat: (num) => `H.Con.Res. ${num}`,
    legiscanFormat: (num) => `HCR${num}`
  },
  
  // Senate Concurrent Resolutions
  {
    legiscanPattern: /^SCR\s*(\d+)$/i,
    federalFormat: (num) => `S.Con.Res. ${num}`,
    legiscanFormat: (num) => `SCR${num}`
  }
];

// Additional patterns for federal-style input normalization
const FEDERAL_PATTERNS: { pattern: RegExp; normalize: (match: RegExpMatchArray) => string }[] = [
  // H.R. 123 -> HB123
  { pattern: /^H\.R\.\s*(\d+)$/i, normalize: (match) => `HB${match[1]}` },
  
  // S. 123 -> SB123
  { pattern: /^S\.\s*(\d+)$/i, normalize: (match) => `SB${match[1]}` },
  
  // H.Res. 123 -> HR123
  { pattern: /^H\.Res\.\s*(\d+)$/i, normalize: (match) => `HR${match[1]}` },
  
  // S.Res. 123 -> SR123
  { pattern: /^S\.Res\.\s*(\d+)$/i, normalize: (match) => `SR${match[1]}` },
  
  // H.J.Res. 123 -> HJR123
  { pattern: /^H\.J\.Res\.\s*(\d+)$/i, normalize: (match) => `HJR${match[1]}` },
  
  // S.J.Res. 123 -> SJR123
  { pattern: /^S\.J\.Res\.\s*(\d+)$/i, normalize: (match) => `SJR${match[1]}` },
  
  // H.Con.Res. 123 -> HCR123
  { pattern: /^H\.Con\.Res\.\s*(\d+)$/i, normalize: (match) => `HCR${match[1]}` },
  
  // S.Con.Res. 123 -> SCR123
  { pattern: /^S\.Con\.Res\.\s*(\d+)$/i, normalize: (match) => `SCR${match[1]}` }
];

/**
 * Formats a LegiScan-style bill number to federal display format
 * @param billNumber - The bill number in LegiScan format (e.g., "HB123", "SJR45")
 * @returns Federal format (e.g., "H.R. 123", "S.J.Res. 45") or original if no match
 */
export function formatBillNumber(billNumber: string | null | undefined): string {
  if (!billNumber) return 'Unknown';
  
  const trimmed = billNumber.trim();
  if (!trimmed) return 'Unknown';
  
  // Try to match against known LegiScan patterns
  for (const mapping of BILL_TYPE_MAPPINGS) {
    const match = trimmed.match(mapping.legiscanPattern);
    if (match) {
      return mapping.federalFormat(match[1]);
    }
  }
  
  // If no pattern matches, return the original (might already be in federal format)
  return trimmed;
}

/**
 * Normalizes user input to LegiScan format for database searching
 * @param input - User input (e.g., "H.R. 123", "hb 45", "SJR44")
 * @returns LegiScan format (e.g., "HB123") or original if no normalization needed
 */
export function normalizeToLegiScanFormat(input: string): string {
  if (!input) return input;
  
  const trimmed = input.trim().replace(/\s+/g, ' '); // Normalize whitespace
  
  // Try federal patterns first
  for (const { pattern, normalize } of FEDERAL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return normalize(match);
    }
  }
  
  // Try LegiScan patterns (normalize spacing and case)
  for (const mapping of BILL_TYPE_MAPPINGS) {
    const match = trimmed.match(mapping.legiscanPattern);
    if (match) {
      return mapping.legiscanFormat(match[1]);
    }
  }
  
  // Return original if no pattern matches
  return trimmed;
}

/**
 * Generates multiple search variants for a bill number input
 * @param input - User input bill number
 * @returns Array of search terms to try against the database
 */
export function generateBillNumberSearchTerms(input: string): string[] {
  if (!input) return [];
  
  const trimmed = input.trim();
  const searchTerms = new Set<string>();
  
  // Add the original input
  searchTerms.add(trimmed);
  
  // Add normalized LegiScan format
  const legiscanFormat = normalizeToLegiScanFormat(trimmed);
  searchTerms.add(legiscanFormat);
  
  // Add federal format
  const federalFormat = formatBillNumber(legiscanFormat);
  searchTerms.add(federalFormat);
  
  // Add variations with different spacing/case
  const upperTrimmed = trimmed.toUpperCase();
  searchTerms.add(upperTrimmed);
  searchTerms.add(upperTrimmed.replace(/\s+/g, ''));
  searchTerms.add(upperTrimmed.replace(/\s+/g, ' '));
  
  // Remove empty strings and return as array
  return Array.from(searchTerms).filter(term => term.length > 0);
}

/**
 * Checks if a string looks like a bill number
 * @param input - String to check
 * @returns boolean indicating if it looks like a bill number
 */
export function isBillNumber(input: string): boolean {
  if (!input) return false;
  
  const trimmed = input.trim();
  
  // Check against all known patterns
  for (const mapping of BILL_TYPE_MAPPINGS) {
    if (mapping.legiscanPattern.test(trimmed)) return true;
  }
  
  for (const { pattern } of FEDERAL_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  
  return false;
}

/**
 * Validates and cleans bill number input
 * @param input - Raw user input
 * @returns Cleaned input or null if invalid
 */
export function validateBillNumber(input: string): string | null {
  if (!input) return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Must look like a bill number
  if (!isBillNumber(trimmed)) return null;
  
  return normalizeToLegiScanFormat(trimmed);
}

/**
 * Enhanced bill number search that handles both bill numbers and text search
 * @param searchTerm - User search input
 * @returns Object with search strategies
 */
export function analyzeSearchTerm(searchTerm: string): {
  isBillNumber: boolean;
  searchTerms: string[];
  searchType: 'bill_number' | 'text' | 'mixed';
} {
  if (!searchTerm) {
    return {
      isBillNumber: false,
      searchTerms: [],
      searchType: 'text'
    };
  }
  
  const trimmed = searchTerm.trim();
  
  // Check if it's a pure bill number
  if (isBillNumber(trimmed)) {
    return {
      isBillNumber: true,
      searchTerms: generateBillNumberSearchTerms(trimmed),
      searchType: 'bill_number'
    };
  }
  
  // Check if it contains a bill number within text
  const words = trimmed.split(/\s+/);
  const billNumbers = words.filter(word => isBillNumber(word));
  
  if (billNumbers.length > 0) {
    const allTerms = new Set<string>();
    allTerms.add(trimmed); // Original search term
    
    // Add bill number variations
    billNumbers.forEach(billNum => {
      generateBillNumberSearchTerms(billNum).forEach(term => allTerms.add(term));
    });
    
    return {
      isBillNumber: false,
      searchTerms: Array.from(allTerms),
      searchType: 'mixed'
    };
  }
  
  // Pure text search
  return {
    isBillNumber: false,
    searchTerms: [trimmed],
    searchType: 'text'
  };
}