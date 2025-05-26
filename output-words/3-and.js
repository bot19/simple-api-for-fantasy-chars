/* using 4.1-mini, changed prompt, got:

Give me a concise list of 1-5 **semantically distinct** core meanings for the word "${word}", as you would find in an English-UK ESL dictionary. Do not include different examples of the same meaning or syntactic usage. If the word has only one core meaning, return just that. No slang, idioms, and minor variants. For each meaning, provide one example phrase using this format: partOfSpeech|examplePhrase

schema array: [
  '1. conjunction|bread and butter',
  '2. conjunction|she sings and dances (used to connect two actions performed by the same subject)',
  '3. conjunction|he is tall and strong (used to connect two adjectives or qualities)',
  '4. conjunction|two and two make four (used to connect numbers or quantities)',
  '5. conjunction|come and see (used to indicate a sequence of actions)'
] 

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
        partOfSpeech: "1. conjunction",
        definition:
          "Used to connect two words, phrases, or clauses, showing that they are related or both included.",
        example: "bread and butter",
        note: 'Use this word to connect two or more words, phrases, or clauses. It shows that the items are related or combined. For example, in "bread and butter," it links two food items together. Remember to use a comma before it when connecting three or more items in a list, like "I like tea, coffee, and juice."',
        synonyms: [
          "also",
          "plus",
          "as well as",
          "together with",
          "along with",
          "in addition to",
          "coupled with",
          "combined with",
        ],
      },
      {
        partOfSpeech: "2. conjunction",
        definition:
          "Used to connect two actions or ideas that are happening at the same time or are related.",
        example:
          "she sings and dances (used to connect two actions performed by the same subject)",
        note: 'When using "and" to connect two actions, remember that both actions should be in the same tense. For example, if you say "She sings and dances," both "sings" and "dances" are in the present tense. This helps the sentence flow smoothly and makes it clear that both actions are happening at the same time.',
        synonyms: [
          "also",
          "plus",
          "as well as",
          "together with",
          "along with",
          "in addition to",
        ],
      },
      {
        partOfSpeech: "3. conjunction",
        definition:
          "Used to connect two words or phrases that describe the same thing, showing that both qualities are true.",
        example:
          "he is tall and strong (used to connect two adjectives or qualities)",
        note: 'When using "and" to connect two adjectives, remember that it shows that both qualities are true at the same time. For example, in the phrase "he is tall and strong," you are saying that he has both qualities. Make sure to use a comma before "and" if you are connecting three or more adjectives, like in "he is tall, strong, and athletic." This helps to clarify the list.',
        synonyms: [
          "also",
          "plus",
          "as well as",
          "together with",
          "along with",
          "in addition to",
        ],
      },
      {
        partOfSpeech: "4. conjunction",
        definition:
          "Used to connect two numbers or amounts together in a sentence.",
        example:
          "two and two make four (used to connect numbers or quantities)",
        note: 'When using "and" to connect numbers or quantities, remember that it shows addition. For example, in "two and two make four," you are combining the numbers two and two to get four. It\'s important to use "and" to clearly indicate that you are adding these amounts together. In spoken English, "and" is pronounced like /ænd/, with a short \'a\' sound, similar to the \'a\' in "cat."',
        synonyms: ["plus", "together with", "along with", "in addition to"],
      },
      {
        partOfSpeech: "5. conjunction",
        definition:
          "Used to connect two actions or events, showing that one happens after the other.",
        example: "come and see (used to indicate a sequence of actions)",
        note: 'When using "and" to connect actions, remember that it shows a sequence. For example, in "come and see," it means you should first come, then see. Use "and" to link similar ideas or actions, making your sentences clearer and more fluid.',
        synonyms: ["also", "plus", "then", "as well as", "along with"],
      },
    ],
  },
];
