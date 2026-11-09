/** The real-world side of an architecture: why it exists, what goes in, what comes out, how to remember it. */
export interface Story {
  problems: { title: string; example: string }[];
  input: { label: string; value: string };
  output: { label: string; value: string; meaning: string };
  /** How the real input travels, one short sentence per stage (input → … → output). */
  journey: string[];
  remember: { oneLiner: string; mnemonic: string; keyIdeas: string[] };
}
