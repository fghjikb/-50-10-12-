import { FOCUS_1_ERROR_WORDS } from './focus1_error_words';
import { FOCUS_2_CONFUSED_WORDS } from './focus2_confused_words';
import { FOCUS_3_SIMILAR_WORDS } from './focus3_similar_words';
import { FOCUS_4_IDIOM_PHONETICS } from './focus4_idiom_phonetics';
import { FOCUS_5_FOOD_PHONETICS } from './focus5_food_phonetics';
import { FOCUS_6_POLYPHONIC_WORDS } from './focus6_polyphonic_words';
import { FOCUS_7_LIFE_PHONETICS } from './focus7_life_phonetics';
import {
  FOCUS_8_CLASSICAL_PARTICLES,
  FOCUS_9_LOAN_WORDS,
} from './focus8_classical_words';

export {
  FOCUS_1_ERROR_WORDS,
  FOCUS_2_CONFUSED_WORDS,
  FOCUS_3_SIMILAR_WORDS,
  FOCUS_4_IDIOM_PHONETICS,
  FOCUS_5_FOOD_PHONETICS,
  FOCUS_6_POLYPHONIC_WORDS,
  FOCUS_7_LIFE_PHONETICS,
  FOCUS_8_CLASSICAL_PARTICLES,
  FOCUS_9_LOAN_WORDS,
};

export const DATA_STATS = {
  focus1Count: FOCUS_1_ERROR_WORDS.length,
  focus2Count: FOCUS_2_CONFUSED_WORDS.length,
  focus3Count: FOCUS_3_SIMILAR_WORDS.reduce((acc, g) => acc + g.entries.length, 0),
  focus4Count: FOCUS_4_IDIOM_PHONETICS.length,
  focus5Count: FOCUS_5_FOOD_PHONETICS.length,
  focus6Count: FOCUS_6_POLYPHONIC_WORDS.length,
  focus7Count: FOCUS_7_LIFE_PHONETICS.length,
  focus8Count: FOCUS_8_CLASSICAL_PARTICLES.length,
  focus9Count: FOCUS_9_LOAN_WORDS.length,
  totalItems:
    FOCUS_1_ERROR_WORDS.length +
    FOCUS_2_CONFUSED_WORDS.length +
    FOCUS_3_SIMILAR_WORDS.reduce((acc, g) => acc + g.entries.length, 0) +
    FOCUS_4_IDIOM_PHONETICS.length +
    FOCUS_5_FOOD_PHONETICS.length +
    FOCUS_6_POLYPHONIC_WORDS.length +
    FOCUS_7_LIFE_PHONETICS.length +
    FOCUS_8_CLASSICAL_PARTICLES.length +
    FOCUS_9_LOAN_WORDS.length,
};

