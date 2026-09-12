import { z } from 'zod';

export const createInstrumentSchema = z.object({
  id: z.string().optional(),
  serialNumber: z.string().min(1, 'Serial number is required'),
  name: z.string().min(1, 'Instrument name is required'),
  type: z.enum([
    'WEIGHING_SCALE',
    'PLATFORM_SCALE',
    'FUEL_DISPENSER',
    'WATER_METER',
    'ELECTRICITY_METER',
    'BALANCE',
    'WEIGHBRIDGE',
    'MILK_METER',
    'TAPE_MEASURE',
    'PRESSURE_GAUGE',
  ]),
  make: z.string().min(1, 'Manufacturer/Make is required'),
  model: z.string().min(1, 'Model is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  accuracy: z.string().min(1, 'Accuracy class is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  installationDate: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  installationAddress: z.string().optional(),
  lastVerificationDate: z.string().optional(),
});

export const updateInstrumentSchema = createInstrumentSchema.partial();
