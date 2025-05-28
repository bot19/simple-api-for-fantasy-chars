/*
  using 4.1-mini, updated prompt, still gives me alternating answers;

  prompt: `Give me a concise list of 1-5 **semantically distinct** core meanings for the word "${word}", as you would find in an English-UK ESL dictionary. Only include meanings that are genuinely different in purpose or function — do not list examples that differ only in grammar or context. If there is only one such meaning, return just that. Format each meaning as: partOfSpeech|examplePhrase\n`,

  'conjunction|bread and butter'

  'conjunction|bread and butter',
  'conjunction|She sings and dances',
  'conjunction|He is tall and strong',
  'conjunction|You can have tea and coffee',
  'conjunction|We visited London and Paris'
*/

const output = [
  {
    word: "and",
    level: {
      rank: 1,
    },
    phonetics: {
      simplified: "and",
    },
    meanings: [
      {
        partOfSpeech: "conjunction",
        definition:
          "Used to connect words or groups of words, showing that they are related or combined.",
        example: "bread and butter",
        note: 'Use "and" to connect words, phrases, or clauses that are similar or related. For example, in "bread and butter," it links two items that are often paired together. Remember to use a comma before "and" when connecting two independent clauses, like in "I like tea, and she likes coffee." This helps clarify the sentence structure.',
      },
    ],
  },
];
