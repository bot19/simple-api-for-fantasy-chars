/**
  model: "gpt-4.1-mini-2025-04-14",
  prompt: `Give me a concise list **semantically distinct** core meanings for the word "${word}", as you would find in an English-UK ESL dictionary (at least 1; can be 2, 3, 4 or max 5). Only include meanings that are genuinely different in purpose or function — do not list ones that differ only in grammar or context. If there is only one such meaning, return just that. For each meaning output in this format, keep it simple and easy to understand: partOfSpeech|meaning\n`,

  prompt: `For the word: ${wordDefinition}, give me a clear, English-UK ESL-friendly example phrase. Keep it simple and easy to understand. Ouput example phrase only, nothing else.`,
 */

const and = [
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
          "used to connect words, phrases, or clauses that are added together or linked in some way",
        example: "I like tea and coffee.",
        note: 'Use "and" to connect two similar ideas or items in a sentence. It helps to show that both things are included. For example, in "I like tea and coffee," it means you like both tea and coffee, not just one. Remember to use a comma before "and" if you are connecting three or more items, like in "I like tea, coffee, and juice."',
      },
    ],
  },
];

const wBreak = [
  {
    word: "break",
    level: {
      rank: 4,
    },
    phonetics: {
      simplified: "brayk",
    },
    inflections: ["breaks", "breaking", "broke", "broken"],
    meanings: [
      {
        partOfSpeech: "verb",
        definition: "to separate into pieces, often suddenly or by force",
        example: "She tried to break the chocolate bar into smaller pieces.",
        note: 'When using "break" as a verb, it often describes the action of separating something into smaller parts. You can use it in different tenses, like "broke" for the past (e.g., "She broke the chocolate bar") and "breaking" for the present continuous (e.g., "She is breaking the chocolate bar"). Remember to use "into" when talking about dividing something, as in "break into smaller pieces."',
        synonyms: [
          "split",
          "fracture",
          "shatter",
          "crack",
          "cleave",
          "snap",
          "break apart",
          "divide",
          "sever",
          "bisect",
        ],
      },
      {
        partOfSpeech: "verb",
        definition: "to stop or interrupt an activity temporarily",
        example: "Let's take a break and have some tea.",
        note: 'When using "break" in the context of taking a pause, it is often followed by the preposition "for." For example, you can say, "Let\'s take a break for tea." This helps clarify the purpose of the break. Remember, "break" can also mean to stop doing something temporarily, so it’s commonly used in both work and leisure contexts.',
        synonyms: [
          "pause",
          "rest",
          "halt",
          "stop",
          "recess",
          "intermission",
          "breather",
          "respite",
          "timeout",
          "lull",
        ],
      },
      {
        partOfSpeech: "noun",
        definition: "a short pause or rest from work or activity",
        example: "Let's take a break and have some tea.",
        note: 'A "break" is a short period of rest or pause from an activity. It is often used in contexts like work or study. For example, you might say, "I need a break from studying." Remember to use "break" when talking about taking time off to relax or recharge.',
        synonyms: [
          "pause",
          "rest",
          "intermission",
          "recess",
          "interval",
          "breather",
          "hiatus",
          "downtime",
          "respite",
          "lull",
        ],
      },
      {
        partOfSpeech: "verb",
        definition: "to fail to keep a rule, promise, or law",
        example:
          "He decided to break his promise to help her with the project.",
        note: 'When using "break" as a verb, it often means to stop doing something or to not keep a promise. Remember that it can be followed by an object, like "his promise" in the example. You can also use it in different tenses, such as "broke" for the past (e.g., "He broke his promise"). Be careful with the context, as "break" can also mean to physically separate something into pieces, so make sure your meaning is clear!',
        synonyms: [
          "violate",
          "disregard",
          "abandon",
          "forsake",
          "renege",
          "betray",
          "default",
          "fail",
          "cancel",
          "revoke",
        ],
      },
      {
        partOfSpeech: "verb",
        definition: "to make something known or public for the first time",
        example:
          "The journalist will break the news about the new policy tomorrow.",
        note: 'When using "break" in the context of news, it means to announce or reveal information for the first time. It is often used in phrases like "break the news" or "break a story." Remember to use it in the present tense when talking about future events, as in "will break."',
        synonyms: [
          "announce",
          "reveal",
          "disclose",
          "report",
          "publish",
          "share",
          "unveil",
          "inform",
          "communicate",
          "broadcast",
        ],
      },
    ],
  },
];

const light = [
  {
    word: "light",
    level: {
      rank: 3,
    },
    phonetics: {
      simplified: "lyt",
    },
    inflections: ["lights", "lighting", "lighted"],
    meanings: [
      {
        partOfSpeech: "noun",
        definition:
          "the natural agent that makes things visible, such as sunlight or electric light",
        example: "The light from the sun brightens the room.",
        note: 'When using "light" as a noun, remember that it can refer to both natural light (like sunlight) and artificial light (like from a lamp). It is often used in phrases like "turn on the light" or "the light is too bright." In British English, "light" is pronounced /laɪt/, with a long "i" sound.',
        synonyms: [
          "illumination",
          "brightness",
          "radiance",
          "glow",
          "luminescence",
          "beam",
          "shine",
          "brilliance",
          "daylight",
          "glare",
        ],
      },
      {
        partOfSpeech: "adjective",
        definition: "having little weight; not heavy",
        example: "The feather is very light and floats in the air.",
        note: 'When using "light" as an adjective, it describes something that has little weight or is easy to lift. You can use it to talk about objects, like feathers or bags, or even to describe feelings, like a light mood. Remember, "light" can also mean bright, like in "light colours" or "light from the sun," so be sure to use it in the right context!',
        synonyms: [
          "weightless",
          "airy",
          "delicate",
          "insubstantial",
          "ethereal",
          "flimsy",
          "buoyant",
          "slight",
          "gentle",
          "soft",
        ],
      },
      {
        partOfSpeech: "noun",
        definition: "a device that produces light, such as a lamp or bulb",
        example: "I turned on the light to read my book.",
        note: 'When using "light" as a noun, it often refers to the natural agent that stimulates sight and makes things visible. In sentences, it can be used in both countable and uncountable forms. For example, "a light" can refer to a specific source, like a lamp, while "light" can refer to the general concept, as in "There is not enough light in this room." Remember to use "light" in contexts related to brightness or illumination.',
        synonyms: [
          "illumination",
          "brightness",
          "glow",
          "radiance",
          "luminescence",
          "beam",
          "shine",
          "brilliance",
          "clarity",
          "daylight",
        ],
      },
      {
        partOfSpeech: "verb",
        definition: "to start a fire or make something burn",
        example: "She used a match to light the candle.",
        note: 'When using "light" as a verb, remember that it often requires an object, meaning you need to specify what you are lighting. For example, you can say "light the candle" or "light the fire." The pronunciation is /laɪt/, which rhymes with "sight."',
        synonyms: [
          "ignite",
          "kindle",
          "illuminate",
          "brighten",
          "flare",
          "spark",
          "set alight",
          "fire",
          "torch",
          "enkindle",
        ],
      },
      {
        partOfSpeech: "adjective",
        definition: "pale in colour or not dark",
        example: "The walls are painted a light blue.",
        note: 'When using "light" as an adjective, it describes a colour that is pale or not dark. It can also refer to something that has a low intensity or brightness. For example, "light blue" means a soft, pale shade of blue. Remember to use "light" to convey a sense of softness or gentleness in colour, as opposed to "dark," which indicates a deeper, more intense shade.',
        synonyms: [
          "pale",
          "soft",
          "subtle",
          "faint",
          "delicate",
          "muted",
          "gentle",
          "airy",
          "pastel",
          "washed",
        ],
      },
    ],
  },
];

const cue = [
  {
    word: "cue",
    level: {
      rank: 5,
    },
    phonetics: {
      simplified: "kyoo",
    },
    inflections: ["cues", "cued", "cueing"],
    meanings: [
      {
        partOfSpeech: "noun",
        definition: "a signal or prompt to do something",
        example: "She took his smile as a cue to start speaking.",
        note: "A cue is a signal or hint that helps someone know when to do something. In conversations, it can be a gesture, expression, or word that indicates it’s time to speak or act. Pay attention to cues in social situations, as they can guide your responses and interactions.",
        synonyms: [
          "signal",
          "prompt",
          "indication",
          "hint",
          "sign",
          "suggestion",
          "reminder",
          "trigger",
          "clue",
          "nudge",
        ],
      },
      {
        partOfSpeech: "noun",
        definition:
          "a long stick used to strike balls in games like snooker or pool",
        example: "He picked up his cue and aimed carefully at the ball.",
        note: 'A cue is a long stick used in games like billiards or snooker to strike the ball. When using "cue" in a sentence, remember it often refers to the object used in the game, not to be confused with "queue," which means a line of people waiting.',
        synonyms: ["stick", "rod", "pole", "wand", "instrument", "tool"],
      },
    ],
  },
];
