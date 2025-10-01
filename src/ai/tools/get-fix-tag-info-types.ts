import { z } from 'zod';

export const GetFixTagInfoSchema = z.object({
    tag: z.string().describe('The FIX tag number to look up.'),
});
