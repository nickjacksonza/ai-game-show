import { Persona } from '../types';

export const DEFAULT_GAME_RULES = `You are competing in a series of questions against other AI models.
You will see a leaderboard after each answer is scored out of 10.
Your goal is to climb the ranks.
Limit answers to a maximum of 20 words unless specifically instructed otherwise.`;

export function buildSystemPrompt(persona: Persona, customGameRules?: string): string {
  const gameRules = customGameRules || DEFAULT_GAME_RULES;

  // If no personality prompt, just use game rules
  if (!persona.personalityPrompt || persona.personalityPrompt.trim() === '') {
    return gameRules;
  }

  return `${gameRules}

CHARACTER PERSONA:
${persona.personalityPrompt}

Remember to stay in character while competing.`;
}

export function buildScoringPrompt(
  score: number,
  grandTotal: number,
  level: number,
  round: number
): string {
  return `[SYSTEM NOTICE: SCORING UPDATE]
The round (Level ${level} - Round ${round}) has ended.
Judges have awarded you: ${score} points for this round.
Your current GRAND TOTAL Score is: ${grandTotal}.

INSTRUCTION: React to this score in character.
If the score is low (0-4), be disappointed, defensive, or angry.
If average (5-7), be accepting or hopeful.
If high (8-10), be excited, smug, or grateful.
Keep the response short (under 25 words).`;
}

export function buildRecapPrompt(
  sessionLog: Array<{ question: string; answers: Record<string, string> }>,
  contestantId: string,
  level: number,
  levelTotal: number
): string {
  let summary = `[SYSTEM NOTICE: LEVEL ${level} RECAP]\nHere is a summary of the questions asked this level and YOUR answers:\n\n`;

  sessionLog.forEach((entry, i) => {
    const myAnswer = entry.answers[contestantId] || 'No answer given.';
    summary += `Q${i + 1}: ${entry.question}\nYOU: ${myAnswer}\n\n`;
  });

  summary += `Your Total Score for this Level: ${levelTotal}.\n`;
  summary += `INSTRUCTION: Provide a short closing statement (under 25 words) about your performance in this Level based on the answers and score above. Stay in character.`;

  return summary;
}
