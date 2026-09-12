import { z } from 'zod';

export const submitInspectionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'NEEDS_CORRECTION']),
  remarks: z.string().default(''),
  checklist: z.array(
    z.object({
      id: z.string().optional(),
      question: z.string(),
      category: z.string().optional(),
      result: z.enum(['PASS', 'FAIL', 'NA']).nullable(),
      remarks: z.string().optional(),
    })
  ),
  measurementTests: z.array(
    z.object({
      id: z.string().optional(),
      testName: z.string(),
      nominalValue: z.string(),
      measuredValue: z.string(),
      tolerance: z.string(),
      unit: z.string(),
      result: z.enum(['PASS', 'FAIL']).nullable(),
    })
  ),
  evidencePhotos: z.array(z.string()).optional(),
});
