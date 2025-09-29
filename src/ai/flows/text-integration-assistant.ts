'use server';

/**
 * @fileOverview An AI assistant to rewrite text messages for smooth integration with 3D images in AR.
 *
 * - rewriteTextForAR - A function that rewrites the text message.
 * - RewriteTextForARInput - The input type for the rewriteTextForAR function.
 * - RewriteTextForAROutput - The return type for the rewriteTextForAR function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteTextForARInputSchema = z.object({
  text: z
    .string()
    .describe('The original text message to be integrated with the 3D image.'),
  imageDescription: z
    .string()
    .describe('A description of the 3D image the text will be displayed with.'),
});

export type RewriteTextForARInput = z.infer<typeof RewriteTextForARInputSchema>;

const RewriteTextForAROutputSchema = z.object({
  rewrittenText: z
    .string()
    .describe(
      'The rewritten text message, optimized for integration with the 3D image in AR.'
    ),
});

export type RewriteTextForAROutput = z.infer<typeof RewriteTextForAROutputSchema>;

export async function rewriteTextForAR(input: RewriteTextForARInput): Promise<RewriteTextForAROutput> {
  return rewriteTextForARFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewriteTextForARPrompt',
  input: {schema: RewriteTextForARInputSchema},
  output: {schema: RewriteTextForAROutputSchema},
  prompt: `You are an AI assistant that helps rewrite text messages so that they smoothly integrate with a 3D image in an AR display.

  Original Text: {{{text}}}
  3D Image Description: {{{imageDescription}}}

  Rewrite the text message to be concise, visually appealing, and contextually relevant to the 3D image.
  Focus on making the message feel like a natural part of the AR experience.
  The rewritten message should retain the original meaning but be optimized for a short display format.
  Return only the rewritten text.
  `,
});

const rewriteTextForARFlow = ai.defineFlow(
  {
    name: 'rewriteTextForARFlow',
    inputSchema: RewriteTextForARInputSchema,
    outputSchema: RewriteTextForAROutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
