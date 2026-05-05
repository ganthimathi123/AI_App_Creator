import { z } from 'zod';

export const FieldTypeSchema = z.enum([
  'text',
  'number',
  'boolean',
  'date',
  'email',
  'select',
  'textarea',
]);

export const FieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: FieldTypeSchema,
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For 'select' type
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
});

export const EntitySchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  fields: z.array(FieldSchema),
  features: z.object({
    csvImport: z.boolean().default(false),
    notifications: z.boolean().default(false),
  }).default({}),
});

export const AppConfigSchema = z.object({
  appName: z.string().min(1),
  theme: z.object({
    primaryColor: z.string().default('#3b82f6'),
    darkMode: z.boolean().default(false),
  }).default({}),
  entities: z.array(EntitySchema),
  i18n: z.record(z.record(z.string())).optional(), // e.g., { 'en': { 'submit': 'Submit' } }
});

export type FieldType = z.infer<typeof FieldTypeSchema>;
export type Field = z.infer<typeof FieldSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
