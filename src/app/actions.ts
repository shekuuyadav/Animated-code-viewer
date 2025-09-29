// @/app/actions.ts
"use server";
import {
  rewriteTextForAR as rewriteTextForARFlow,
  type RewriteTextForARInput,
} from "@/ai/flows/text-integration-assistant";

export async function rewriteTextForAR(input: RewriteTextForARInput) {
  try {
    const result = await rewriteTextForARFlow(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to rewrite text." };
  }
}
