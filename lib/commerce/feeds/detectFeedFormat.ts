import type { FeedDetectionResult, FeedMapping } from "@/types/feedImport";
import { detectFieldMapping } from "@/config/feedFieldMappings";

export function detectFeedFormat(content: string, _fileName?: string): FeedDetectionResult {
  const trimmed = content.trim();

  // Try JSON first
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return detectJsonFormat(trimmed);
  }

  // Try CSV
  if (trimmed.includes("\n") && (trimmed.includes(",") || trimmed.includes("\t"))) {
    return detectCsvFormat(trimmed);
  }

  return {
    format: "unknown",
    detectedMapping: [],
    sampleRows: [],
    columnCount: 0,
    rowCount: 0,
    confidence: "low",
    warnings: ["Unable to detect format. Expected CSV or JSON."],
  };
}

function detectJsonFormat(content: string): FeedDetectionResult {
  try {
    const parsed = JSON.parse(content);
    const array = Array.isArray(parsed) ? parsed : [parsed];

    if (array.length === 0) {
      return {
        format: "json",
        detectedMapping: [],
        sampleRows: [],
        columnCount: 0,
        rowCount: 0,
        confidence: "low",
        warnings: ["JSON array is empty."],
      };
    }

    const firstRow = array[0] as Record<string, unknown>;
    const headers = Object.keys(firstRow);
    const mapping = detectFieldMapping(headers);

    const sampleRows = array.slice(0, 5).map((r) => {
      const row: Record<string, string> = {};
      for (const key of headers) {
        row[key] = String((r as Record<string, unknown>)[key] ?? "");
      }
      return row;
    });

    const missingRequired = getMissingRequired(mapping);

    return {
      format: "json",
      detectedMapping: mapping,
      sampleRows,
      columnCount: headers.length,
      rowCount: array.length,
      confidence: missingRequired.length === 0 ? "high" : "medium",
      warnings: missingRequired.length > 0
        ? [`Missing required fields: ${missingRequired.join(", ")}`]
        : [],
    };
  } catch {
    return {
      format: "json",
      detectedMapping: [],
      sampleRows: [],
      columnCount: 0,
      rowCount: 0,
      confidence: "low",
      warnings: ["Invalid JSON format."],
    };
  }
}

function detectCsvFormat(content: string): FeedDetectionResult {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    return {
      format: "csv",
      detectedMapping: [],
      sampleRows: [],
      columnCount: 0,
      rowCount: 0,
      confidence: "low",
      warnings: ["CSV must have at least a header row and one data row."],
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseLine(lines[0], delimiter);
  const mapping = detectFieldMapping(headers);

  const sampleRows = lines.slice(1, 6).map((line) => {
    const values = parseLine(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });

  const dataLines = lines.slice(1).filter((l) => l.trim().length > 0);
  const missingRequired = getMissingRequired(mapping);

  return {
    format: "csv",
    detectedMapping: mapping,
    sampleRows,
    columnCount: headers.length,
    rowCount: dataLines.length,
    confidence: missingRequired.length === 0 ? "high" : "medium",
    warnings: missingRequired.length > 0
      ? [`Missing required fields: ${missingRequired.join(", ")}`]
      : [],
  };
}

function detectDelimiter(headerLine: string): string {
  const tabCount = (headerLine.match(/\t/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  return tabCount > commaCount ? "\t" : ",";
}

function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function getMissingRequired(mapping: FeedMapping[]): string[] {
  const titleMapping = mapping.find((m) => m.targetField === "title");
  const priceMapping = mapping.find((m) => m.targetField === "price");

  const missing: string[] = [];
  if (!titleMapping) missing.push("title");
  if (!priceMapping) missing.push("price");
  return missing;
}

export function parseCsvToRows(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseLine(lines[0], delimiter);

  const rows = lines.slice(1)
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const values = parseLine(line, delimiter);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || "";
      });
      return row;
    });

  return { headers, rows };
}
