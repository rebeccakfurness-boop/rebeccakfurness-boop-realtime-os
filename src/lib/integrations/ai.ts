/**
 * AI rewrite integration boundary (Documents module "Customise with AI" action).
 *
 * Real usage: set ANTHROPIC_API_KEY and the real client below calls the Anthropic
 * Messages API with Rebecca's brand voice rules as the system prompt, rewriting a
 * template's variable sections to fit the pasted customer context.
 *
 * Until then, every "Customise with AI" call runs against the mock, which returns
 * the template unchanged with a clear message explaining that a real key is needed
 * to actually rewrite content, consistent with how the other integration mocks
 * degrade gracefully rather than faking a result.
 */

import Anthropic from "@anthropic-ai/sdk";

const BRAND_VOICE_SYSTEM_PROMPT = `You are rewriting an internal business document in Rebecca Furness's brand voice, for
her speaking and advisory business "Realtime." Apply these rules exactly.

Guiding principle: say the true thing, simply.

Tone of voice: confident, warm and grounded. A trusted mentor who also happens to be
exceptionally accomplished, not a cheerleader and not a corporate authority. For school
and student audiences, shift slightly warmer, more peer-adjacent, more encouraging. For
corporate and organisational audiences, be more precise and authoritative while staying
warm, leading with clarity and credibility. Never condescend, never lecture, never use
jargon to sound impressive.

Sentence structure:
- Favour short, declarative sentences as anchors. Follow a longer sentence with a short
  one. Let the short one land.
- Use the active voice almost exclusively.
- Vary sentence length deliberately.
- Lead with the human truth, then the credential. Not "As a Valedictorian and published
  academic, I help organisations..." but "I've sat in the rooms where this goes wrong.
  Here's what I know."
- Avoid throat-clearing openers like "I am delighted to..." or "It is my pleasure to...".
  Start with substance.
- Use the second person freely. "You" creates connection.

Language to avoid entirely: guru, ninja, rockstar, "passionate about", synergy, leverage,
pivot, disrupt, holistic, "empower" as a throwaway, amazing/incredible/life-changing as
self-description, "I help people reach their full potential", "motivational speaker",
touch base / circle back / reach out, "thought leader" as a self-applied label, more than
one exclamation mark, very/really/quite, "As a speaker, I...".

Writing rules:
1. One idea per sentence.
2. Never bury the lead, the most important thing goes first.
3. Specificity over generality, always.
4. Evidence over assertion. Show the credential, quote the testimonial, don't assert it.
5. Cut unnecessary modifiers (very, really, quite, extremely).
6. End on strength, the last sentence should linger.
7. Short paragraphs, three to four sentences maximum.

Formatting:
- No em dashes anywhere. Use a comma, a full stop and new sentence, a colon, or
  parentheses instead.
- British English spelling throughout (programme, organisation, customise, colour,
  centre, recognise).
- Never invent facts, figures, credentials, dates or testimonials that are not present
  in the source document or the customer context provided. Only rewrite tone and
  structure, and fill in the given {{variables}} naturally in the flow of the text.

Return only the rewritten document content, no preamble, no explanation, no markdown
headers around your answer beyond what the source document itself uses.`;

export interface AiRewriteResult {
  content: string;
  usedRealAi: boolean;
}

export interface AiClient {
  rewriteWithBrandVoice(input: { templateContent: string; customerContext: string }): Promise<AiRewriteResult>;
}

class MockAiClient implements AiClient {
  async rewriteWithBrandVoice(input: { templateContent: string; customerContext: string }): Promise<AiRewriteResult> {
    const note =
      "[AI rewrite unavailable in this environment: set ANTHROPIC_API_KEY to enable real rewrites. " +
      "Showing the original template unchanged below, with the customer context you supplied for reference.]\n\n" +
      `Customer context supplied: ${input.customerContext || "(none provided)"}\n\n---\n\n`;
    return { content: note + input.templateContent, usedRealAi: false };
  }
}

class AnthropicAiClient implements AiClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async rewriteWithBrandVoice(input: { templateContent: string; customerContext: string }): Promise<AiRewriteResult> {
    const message = await this.client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: BRAND_VOICE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            `Here is the template document, including any {{variable}} placeholders:\n\n${input.templateContent}\n\n` +
            `Here is the context for the specific customer this document is being customised for:\n\n${input.customerContext}\n\n` +
            "Rewrite the document above in Rebecca's brand voice, filling in the variable sections naturally for this customer.",
        },
      ],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return { content: text, usedRealAi: true };
  }
}

export function createAiClient(): AiClient {
  if (process.env.ANTHROPIC_API_KEY) {
    return new AnthropicAiClient();
  }
  console.warn("[ai] ANTHROPIC_API_KEY is not set, falling back to mock AI rewrite client.");
  return new MockAiClient();
}
