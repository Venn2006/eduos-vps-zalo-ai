import { z } from "zod";

export const SetupCommandParsedSchema = z.object({
  commandType: z.literal("SETUP"),
  classCode: z.string().optional(),
  cloneFromClassCode: z.string().optional(),
  className: z.string().optional(),
  courseName: z.string().optional(),
  teacherName: z.string().optional(),
  scheduleText: z.string().optional(),
  startDate: z.string().optional(),
  templateName: z.string().optional(),
}).refine((data) => !!data.classCode || !!data.className, {
  message: "Either classCode or className must be provided in the setup command",
});

export type SetupCommandParsed = z.infer<typeof SetupCommandParsedSchema>;

export function parseSetupCommand(text: string): SetupCommandParsed | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/setup")) {
    return null;
  }

  const result: Partial<SetupCommandParsed> = { commandType: "SETUP" };

  // Remove "/setup"
  const argsString = trimmed.substring(6).trim();
  
  if (!argsString) {
    return null;
  }

  // Regex to extract key=value pairs, where value can be quoted
  const keyValueRegex = /([a-zA-Z]+)=("([^"]+)"|'([^']+)'|(\S+))/g;
  let match;
  let hasKeyValue = false;

  while ((match = keyValueRegex.exec(argsString)) !== null) {
    hasKeyValue = true;
    const key = match[1];
    const value = match[3] || match[4] || match[5];

    switch (key) {
      case "classCode":
      case "class":
        if (key === "classCode") result.classCode = value;
        if (key === "class") result.className = value;
        break;
      case "clone":
        result.cloneFromClassCode = value;
        break;
      case "course":
        result.courseName = value;
        break;
      case "teacher":
        result.teacherName = value;
        break;
      case "schedule":
        result.scheduleText = value;
        break;
      case "start":
        result.startDate = value;
        break;
      case "template":
        result.templateName = value;
        break;
    }
  }

  // If no key-value pairs were found, assume the first token is classCode, and optional second is clone
  if (!hasKeyValue) {
    const parts = argsString.split(" ");
    if (parts[0]) {
      result.classCode = parts[0];
    }
    // Check if parts[1] is clone=... (already handled by regex but just in case)
    if (parts.length > 1) {
       for (let i = 1; i < parts.length; i++) {
         const p = parts[i];
         if (p.startsWith("clone=")) {
            result.cloneFromClassCode = p.substring(6);
         }
       }
    }
  } else {
    // If it has key value but the first token is NOT a key=value, it might be: `/setup HSK1-A06 clone=HSK1-A05`
    // Let's check the very first token to see if it doesn't contain '='
    const firstTokenMatch = /^(\S+)/.exec(argsString);
    if (firstTokenMatch && !firstTokenMatch[1].includes("=")) {
      result.classCode = firstTokenMatch[1];
    }
  }

  try {
    return SetupCommandParsedSchema.parse(result);
  } catch (e) {
    return null; // Return null if validation fails
  }
}
