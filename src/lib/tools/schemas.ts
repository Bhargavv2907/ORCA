import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lon: z.number().finite().min(-180).max(180),
});

export const ToolStatusSchema = z.enum(['live', 'cached', 'unavailable']);
export const ToolTypeSchema = z.enum(['observation', 'forecast', 'advisory']);

export const NormalizedToolResultSchema = <T extends z.ZodType>(valueSchema: T) => z.object({
  source: z.string().min(1),
  retrievedAt: z.string().datetime(),
  validFrom: z.string().datetime().nullable(),
  validUntil: z.string().datetime().nullable(),
  location: CoordinatesSchema.nullable(),
  value: valueSchema.nullable(),
  unit: z.string().nullable(),
  type: ToolTypeSchema,
  status: ToolStatusSchema,
  reason: z.string().min(1).optional(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type ToolStatus = z.infer<typeof ToolStatusSchema>;
export type ToolType = z.infer<typeof ToolTypeSchema>;
export type NormalizedToolResult<T> = {
  source: string;
  retrievedAt: string;
  validFrom: string | null;
  validUntil: string | null;
  location: Coordinates | null;
  value: T | null;
  unit: string | null;
  type: ToolType;
  status: ToolStatus;
  reason?: string;
};

export function normalizeResult<T>(
  valueSchema: z.ZodType<T>,
  result: NormalizedToolResult<T>,
): NormalizedToolResult<T> {
  return NormalizedToolResultSchema(valueSchema).parse(result) as NormalizedToolResult<T>;
}

export const LocationInputSchema = z.object({ location: CoordinatesSchema });
export const OptionalLocationInputSchema = z.object({ location: CoordinatesSchema.optional() });
