// 🏛️ Bill Number Normalization and Formatting Utilities
// Handles conversion between LegiScan format (stored) and Federal format (displayed)

export interface BillNumberMapping {
  legiscanPattern: RegExp;
  federalFormat: (number: string) => string;
  legiscanFormat: (number: string) => string;
  userInputPatterns: RegExp[];
}

// Comprehensive mapping of bill types with LegiScan compatibility
const BILL_TYPE_MAPPINGS: BillNumberMapping[] = [
  // House Bills: HB7 → HR7 (LegiScan format)
  {
    legiscanPattern: /^HR\s*(\d+)$/i, // LegiScan stores as HR
    federalFormat: (num) => `H.R. ${num}`,
    legiscanFormat: (num) => `HR${num}`,
    userInputPatterns: [/^HB\s*(\d+)$/i, /^H\.R\.\s*(\d+)$/i, /^HR\s*(\d+)$/i]
  },
  
  // Senate Bills: SB74 → SR74 (LegiScan format) 
  {
    legiscanPattern: /^SR\s*(\d+)$/i, // LegiScan stores as SR
    federalFormat: (num) => `S. ${num}`,
    legiscanFormat: (num) => `SR${num}`,
    userInputPatterns: [/^SB\s*(\d+)$/i, /^S\.\s*(\d+)$/i, /^SR\s*(\d+)$/i]
  },
  
  // House Resolutions
  {
    legiscanPattern: /^HRES\s*(\d+)$/i, // LegiScan stores as HRES
    federalFormat: (num) => `H.Res. ${num}`,
    legiscanFormat: (num) => `HRES${num}`,
    userInputPatterns: [/^HR\s*(\d+)$/i, /^H\.RES\.\s*(\d+)$/i, /^HRES\s*(\d+)$/i]
  },
  
  // Senate Resolutions  
  {
    legiscanPattern: /^SRES\s*(\d+)$/i, // LegiScan stores as SRES
    federalFormat: (num) => `S.Res. ${num}`,
    legiscanFormat: (num) => `SRES${num}`,
    userInputPatterns: [/^SR\s*(\d+)$/i, /^S\.RES\.\s*(\d+)$/i, /^SRES\s*(\d+)$/i]
  },
  
  // House Joint Resolutions
  {
    legiscanPattern: /^HJR\s*(\d+)$/i,
    federalFormat: (num) => `H.J.Res. ${num}`,
    legiscanFormat: (num) => `HJR${num}`,
    userInputPatterns: [/^HJR\s*(\d+)$/i, /^H\.J\.RES\.\s*(\d+)$/i]
  },
  
  // Senate Joint Resolutions
  {
    legiscanPattern: /^SJR\s*(\d+)$/i,
    federalFormat: (num) => `S.J.Res. ${num}`,
    legiscanFormat: (num) => `SJR${num}`,
    userInputPatterns: [/^SJR\s*(\d+)$/i, /^S\.J\.RES\.\s*(\d+)$/i]
  },
  
  // House Concurrent Resolutions
  {
    legiscanPattern: /^HCONRES\s*(\d+)$/i,
    federalFormat: (num) => `H.Con.Res. ${num}`,
    legiscanFormat: (num) => `HCONRES${num}`,
    userInputPatterns: [/^HCR\s*(\d+)$/i, /^H\.CON\.RES\.\s*(\d+)$/i, /^HCONRES\s*(\d+)$/i]
  },
  
  // Senate Concurrent Resolutions
  {
    legiscanPattern: /^SCONRES\s*(\d+)$/i,
    federalFormat: (num) => `S.Con.Res. ${num}`,
    legiscanFormat: (num) => `SCONRES${num}`,
    userInputPatterns: [/^SCR\s*(\d+)$/i, /^S\.CON\.RES\.\s*(\d+)$/i, /^SCONRES\s*(\d+)$/i]
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
 * Normalizes user input for bill number searching with enhanced exact matching
 * @param input - User input (e.g., "H.R. 123", "hb 45", "SJR44") 
 * @returns Object with normalized input and exact match candidate
 */
export function normalizeInputForSearch(input: string): {
  normalizedInput: string;
  exactMatchTerm: string | null;
  isExactBillNumber: boolean;
} {
  if (!input) {
    return {
      normalizedInput: input,
      exactMatchTerm: null,
      isExactBillNumber: false
    };
  }
  
  // Normalize: strip spaces, punctuation, lowercase
  const normalized = input.trim()
    .replace(/[^\w\d]/g, '') // Remove all punctuation and spaces
    .toLowerCase();
  
  // Check if this looks like an exact bill number
  for (const mapping of BILL_TYPE_MAPPINGS) {
    // Check all user input patterns for this bill type
    for (const pattern of mapping.userInputPatterns) {
      const match = input.trim().match(pattern);
      if (match) {
        return {
          normalizedInput: normalized,
          exactMatchTerm: mapping.legiscanFormat(match[1]),
          isExactBillNumber: true
        };
      }
    }
  }
  
  return {
    normalizedInput: normalized,
    exactMatchTerm: null,
    isExactBillNumber: false
  };
}

/**
 * Legacy function - now calls the enhanced version
 * @param input - User input
 * @returns LegiScan format or original
 */
export function normalizeToLegiScanFormat(input: string): string {
  const result = normalizeInputForSearch(input);
  return result.exactMatchTerm || result.normalizedInput;
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
 * Enhanced bill number search that prioritizes exact matches and handles full-text search
 * @param searchTerm - User search input
 * @returns Object with search strategies including exact match priority
 */
export function analyzeSearchTerm(searchTerm: string): {
  isBillNumber: boolean;
  searchTerms: string[];
  searchType: 'exact_bill' | 'bill_number' | 'text' | 'mixed';
  exactMatchTerm: string | null;
  normalizedInput: string;
} {
  if (!searchTerm) {
    return {
      isBillNumber: false,
      searchTerms: [],
      searchType: 'text',
      exactMatchTerm: null,
      normalizedInput: ''
    };
  }
  
  const searchAnalysis = normalizeInputForSearch(searchTerm);
  
  // Exact bill number match - highest priority
  if (searchAnalysis.isExactBillNumber && searchAnalysis.exactMatchTerm) {
    return {
      isBillNumber: true,
      searchTerms: [searchAnalysis.exactMatchTerm],
      searchType: 'exact_bill',
      exactMatchTerm: searchAnalysis.exactMatchTerm,
      normalizedInput: searchAnalysis.normalizedInput
    };
  }
  
  const trimmed = searchTerm.trim();
  
  // Check if it's a general bill number pattern
  if (isBillNumber(trimmed)) {
    return {
      isBillNumber: true,
      searchTerms: generateBillNumberSearchTerms(trimmed),
      searchType: 'bill_number',
      exactMatchTerm: null,
      normalizedInput: searchAnalysis.normalizedInput
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
      searchType: 'mixed',
      exactMatchTerm: null,
      normalizedInput: searchAnalysis.normalizedInput
    };
  }
  
  // Pure text search with full-text search capability
  return {
    isBillNumber: false,
    searchTerms: [trimmed],
    searchType: 'text',
    exactMatchTerm: null,
    normalizedInput: searchAnalysis.normalizedInput
  };
}