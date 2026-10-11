import {
  FOCUS_1_ERROR_WORDS,
  FOCUS_2_CONFUSED_WORDS,
  FOCUS_3_SIMILAR_WORDS,
  FOCUS_4_IDIOM_PHONETICS,
  FOCUS_5_FOOD_PHONETICS,
  FOCUS_6_POLYPHONIC_WORDS,
  FOCUS_7_LIFE_PHONETICS,
  FOCUS_8_CLASSICAL_PARTICLES,
  FOCUS_9_LOAN_WORDS,
} from '../data';
import { QuizType } from '../types';

export interface QuizQuestion {
  id: string;
  sourceId: string;
  type: QuizType;
  prompt: string;
  subPrompt?: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation: string;
  category: string;
  hint?: string;
}


// Utility to shuffle array
const shuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Generate distractors for characters
const COMMON_CHAR_POOL = [
  '抱', '暴', '部', '步', '跋', '拔', '輩', '備', '板', '版',
  '璧', '壁', '碧', '幣', '蔽', '僻', '辟', '劈', '批', '披',
  '燥', '躁', '噪', '暇', '瑕', '遐', '券', '卷', '迭', '疊',
  '亟', '極', '截', '竭', '矇', '蒙', '朦', '濛', '竣', '峻',
  '駿', '淬', '悴', '粹', '瘁', '萃', '辨', '辯', '辮', '瓣',
  '滄', '蒼', '弛', '馳', '濫', '爛', '磬', '罄', '馨', '啜',
  '輟', '綴', '俾', '裨', '婢', '稗', '瞻', '贍', '蟾', '藉',
  '籍', '溯', '朔', '塑', '拮', '詰', '佶', '炙', '灸', '掣',
];

// Generate distractors for zhuyin
const COMMON_ZHUYIN_POOL = [
  'ㄅㄠˋ', 'ㄅㄨˋ', 'ㄅㄚˊ', 'ㄅㄟˋ', 'ㄅㄢˇ', 'ㄅㄧˇ', 'ㄅㄧˋ',
  'ㄆㄧㄥˊ', 'ㄆㄧㄠˇ', 'ㄆㄧˇ', 'ㄆㄢˊ', 'ㄇㄛˋ', 'ㄇㄧˇ', 'ㄈㄨˊ',
  'ㄉㄧˊ', 'ㄉㄨㄥˋ', 'ㄊㄠ', 'ㄊㄚˋ', 'ㄋㄧˋ', 'ㄌㄞˋ', 'ㄌㄧˋ',
  'ㄍㄨㄥ', 'ㄍㄨˇ', 'ㄎㄨㄟˋ', 'ㄏㄨˋ', 'ㄏㄜˋ', 'ㄐㄧㄥˋ', 'ㄐㄩˇ',
  'ㄑㄧㄝˋ', 'ㄒㄧㄚˊ', 'ㄒㄧㄢˊ', 'ㄓˋ', 'ㄓㄨㄟˋ', 'ㄔˋ', 'ㄕㄨㄣˇ',
  'ㄕㄚ', 'ㄙˋ', 'ㄖㄨˋ', 'ㄖㄣˇ', 'ㄧㄚˊ', 'ㄘㄨㄢ', 'ㄊㄡˊ', 'ㄘㄥ',
];

export const generateQuizQuestions = (
  type: QuizType,
  count: number = 20,
  categoryFilter?: string
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];

  // Helper generator 1: Focus 1 Character choice
  const makeFocus1CharQuestion = (): QuizQuestion | null => {
    const pool = categoryFilter && categoryFilter !== 'all'
      ? FOCUS_1_ERROR_WORDS.filter((w) => w.category === categoryFilter)
      : FOCUS_1_ERROR_WORDS;
    if (pool.length === 0) return null;

    const item = pool[Math.floor(Math.random() * pool.length)];
    const correct = item.targetChar;
    const blankPhrase = item.charWithParens.replace(/\([^\)]+\)/g, '（　）');

    // Create 3 distractors
    const distractors = new Set<string>();
    if (item.commonMistake && item.commonMistake !== correct) {
      distractors.add(item.commonMistake);
    }

    // Add plausible other characters from same category or pool
    const sameCat = FOCUS_1_ERROR_WORDS.filter((w) => w.category === item.category && w.targetChar !== correct);
    for (const c of shuffle(sameCat)) {
      if (distractors.size >= 3) break;
      distractors.add(c.targetChar);
    }

    for (const c of shuffle(COMMON_CHAR_POOL)) {
      if (distractors.size >= 3) break;
      if (c !== correct) distractors.add(c);
    }

    const options = shuffle([correct, ...Array.from(distractors).slice(0, 3)]);
    const correctIndex = options.indexOf(correct);

    return {
      id: `q-f1-char-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: item.id,
      type: 'char_choice',
      prompt: `請選出「${blankPhrase}」括號中正確的國字：`,
      subPrompt: `提示注音：【${item.zhuyin}】｜釋義：${item.meaning}`,
      options,
      correctAnswer: correct,
      correctIndex,
      explanation: `正確答案為「${correct}」（${item.zhuyin}）。【釋義】：${item.meaning}。${item.commonMistake ? `注意常誤寫為「${item.commonMistake}」！` : ''}`,
      category: '焦點一：易錯字形',
      hint: `注音為 ${item.zhuyin}`,
    };
  };

  // Helper generator 2: Zhuyin choice (Focus 4 & Focus 5 & Focus 1)
  const makeZhuyinQuestion = (): QuizQuestion => {
    // 50% chance Focus 4/5, 50% chance Focus 1
    const roll = Math.random();

    if (roll < 0.4 && FOCUS_5_FOOD_PHONETICS.length > 0) {
      const item = FOCUS_5_FOOD_PHONETICS[Math.floor(Math.random() * FOCUS_5_FOOD_PHONETICS.length)];
      const correct = item.zhuyin;
      const distractors = new Set<string>();
      if (item.note) {
        // extract misread hints like 常誤讀成「ㄗㄥ」
        const match = item.note.match(/「([^」]+)」/);
        if (match && match[1] && match[1] !== correct && match[1].length <= 5) {
          distractors.add(match[1]);
        }
      }
      for (const z of shuffle(COMMON_ZHUYIN_POOL)) {
        if (distractors.size >= 3) break;
        if (z !== correct) distractors.add(z);
      }
      const options = shuffle([correct, ...Array.from(distractors).slice(0, 3)]);
      return {
        id: `q-food-zhu-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: item.id,
        type: 'zhuyin_choice',
        prompt: `日常美食料理：「${item.foodName}」中「${item.targetChar}」的正確注音為何？`,
        subPrompt: item.note ? `（請選出教育部國語審定音）` : undefined,
        options,
        correctAnswer: correct,
        correctIndex: options.indexOf(correct),
        explanation: `正確讀音為「${correct}」。${item.note || ''}`,
        category: '焦點五：日常美食料理讀音',
      };
    } else if (roll < 0.5 && FOCUS_7_LIFE_PHONETICS.length > 0) {
      const item = FOCUS_7_LIFE_PHONETICS[Math.floor(Math.random() * FOCUS_7_LIFE_PHONETICS.length)];
      const correct = item.zhuyin;
      const distractors = new Set<string>();
      if (item.note) {
        const match = item.note.match(/「([^」]+)」/);
        if (match && match[1] && match[1] !== correct && match[1].length <= 5) {
          distractors.add(match[1]);
        }
      }
      for (const z of shuffle(COMMON_ZHUYIN_POOL)) {
        if (distractors.size >= 3) break;
        if (z !== correct) distractors.add(z);
      }
      const options = shuffle([correct, ...Array.from(distractors).slice(0, 3)]);
      return {
        id: `q-life-zhu-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: item.id,
        type: 'zhuyin_choice',
        prompt: `生活與常考語詞：「${item.phrase}」中的「${item.targetChar}」字，正確注音為何？`,
        subPrompt: item.note ? `（選出教育部審定標準音）` : undefined,
        options,
        correctAnswer: correct,
        correctIndex: options.indexOf(correct),
        explanation: `正確讀音為「${correct}」。${item.note || ''}`,
        category: '焦點七：生活與常考語音',
      };
    } else if (roll < 0.75 && FOCUS_4_IDIOM_PHONETICS.length > 0) {
      const item = FOCUS_4_IDIOM_PHONETICS[Math.floor(Math.random() * FOCUS_4_IDIOM_PHONETICS.length)];
      const correct = item.zhuyin;
      const distractors = new Set<string>();
      for (const z of shuffle(COMMON_ZHUYIN_POOL)) {
        if (distractors.size >= 3) break;
        if (z !== correct) distractors.add(z);
      }
      const options = shuffle([correct, ...Array.from(distractors).slice(0, 3)]);
      return {
        id: `q-idiom-zhu-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: item.id,
        type: 'zhuyin_choice',
        prompt: `成語「${item.phrase}」中的「${item.targetChar}」字，正確注音為何？`,
        subPrompt: item.explanation ? `詞義參考：${item.explanation}` : undefined,
        options,
        correctAnswer: correct,
        correctIndex: options.indexOf(correct),
        explanation: `「${item.phrase}」中的「${item.targetChar}」讀作「${correct}」。【解釋】：${item.explanation}`,
        category: '焦點四：常考成語字音',
      };
    } else {
      const item = FOCUS_1_ERROR_WORDS[Math.floor(Math.random() * FOCUS_1_ERROR_WORDS.length)];
      const correct = item.zhuyin;
      const distractors = new Set<string>();
      for (const z of shuffle(COMMON_ZHUYIN_POOL)) {
        if (distractors.size >= 3) break;
        if (z !== correct) distractors.add(z);
      }
      const options = shuffle([correct, ...Array.from(distractors).slice(0, 3)]);
      return {
        id: `q-f1-zhu-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: item.id,
        type: 'zhuyin_choice',
        prompt: `詞語「${item.fullPhrase}」中的「${item.targetChar}」字，正確注音為何？`,
        options,
        correctAnswer: correct,
        correctIndex: options.indexOf(correct),
        explanation: `「${item.targetChar}」讀作「${correct}」。詞義：${item.meaning}`,
        category: '焦點一：字音複習',
      };
    }
  };

  // Helper generator: Polyphonic question (Focus 6)
  const makePolyphonicQuestion = (): QuizQuestion => {
    const item = FOCUS_6_POLYPHONIC_WORDS[Math.floor(Math.random() * FOCUS_6_POLYPHONIC_WORDS.length)];
    const chosenReading = item.readings[Math.floor(Math.random() * item.readings.length)];
    const chosenExample = chosenReading.examples[Math.floor(Math.random() * chosenReading.examples.length)];
    const correct = chosenReading.zhuyin;

    const distractors = new Set<string>();
    // Add other readings of same char first
    item.readings.forEach((r) => {
      if (r.zhuyin !== correct) distractors.add(r.zhuyin);
    });
    // Add random distractors if needed
    for (const z of shuffle(COMMON_ZHUYIN_POOL)) {
      if (distractors.size >= 3) break;
      if (z !== correct) distractors.add(z);
    }
    const options = shuffle([correct, ...Array.from(distractors).slice(0, 3)]);

    return {
      id: `q-poly-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: item.id,
      type: 'polyphonic_choice',
      prompt: `一字多音辨析：詞語「${chosenExample}」中的「${item.char}」字，正確讀音應為？`,
      subPrompt: item.mnemonic ? `記憶口訣：${item.mnemonic}` : `含義：${chosenReading.meaning}`,
      options,
      correctAnswer: correct,
      correctIndex: options.indexOf(correct),
      explanation: `「${chosenExample}」中的「${item.char}」讀作「${correct}」（${chosenReading.meaning}）。其多音用法：${item.readings.map((r) => `【${r.zhuyin}】：${r.examples.join('、')}（${r.meaning}）`).join('；')}`,
      category: '焦點六：一字多音破音字辨析',
    };
  };

  // Helper generator 3: Meaning choice (Focus 1 / Focus 4 / Focus 2)
  const makeMeaningQuestion = (): QuizQuestion => {
    // Pick from items that have distinct meanings
    const validItems = FOCUS_1_ERROR_WORDS.filter((w) => w.meaning && w.meaning.length > 2);
    const item = validItems[Math.floor(Math.random() * validItems.length)];
    const correct = item.meaning;

    // Pick 3 random other meanings from other words
    const otherItems = shuffle(validItems.filter((w) => w.id !== item.id)).slice(0, 3);
    const options = shuffle([correct, ...otherItems.map((o) => o.meaning)]);

    return {
      id: `q-mean-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: item.id,
      type: 'meaning_choice',
      prompt: `詞語「${item.fullPhrase}」中的「${item.targetChar}」（${item.zhuyin}）字，其詞義釋義為何？`,
      options,
      correctAnswer: correct,
      correctIndex: options.indexOf(correct),
      explanation: `「${item.fullPhrase}」中「${item.targetChar}」之釋義為：「${item.meaning}」。`,
      category: '焦點一：國文字詞釋義',
    };
  };

  // Helper generator 4: Confused word discrimination (Focus 2 & Focus 3)
  const makeConfusedQuestion = (): QuizQuestion => {
    if (Math.random() > 0.4 && FOCUS_2_CONFUSED_WORDS.length > 0) {
      // Pick a group like ['密', '蜜']
      const group = FOCUS_2_CONFUSED_WORDS[Math.floor(Math.random() * FOCUS_2_CONFUSED_WORDS.length)];
      // Choose one example
      const ex = group.examples[Math.floor(Math.random() * group.examples.length)];
      const targetChar = ex.char;
      // split phrases
      const phrases = ex.phrase.split(/[、，]/).filter((p) => p.includes(targetChar));
      const chosenPhrase = phrases.length > 0 ? phrases[0] : `${targetChar}（詞例）`;
      const maskedPhrase = chosenPhrase.replace(new RegExp(targetChar, 'g'), '（　）');

      const options = shuffle([...group.chars]);
      while (options.length < 4) {
        for (const c of shuffle(COMMON_CHAR_POOL)) {
          if (!options.includes(c)) {
            options.push(c);
            break;
          }
        }
      }

      return {
        id: `q-conf-${group.id}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: group.id,
        type: 'confused_choice',
        prompt: `【字詞辨析】請選出填入「${maskedPhrase}」括號中最恰當的字：`,
        subPrompt: `辨析提示：${ex.explanation || ''}`,
        options: options.slice(0, 4),
        correctAnswer: targetChar,
        correctIndex: options.slice(0, 4).indexOf(targetChar),
        explanation: `正確為「${targetChar}」。${group.examples.map((e) => `【${e.char}】：${e.phrase}（${e.explanation}）`).join('；')}`,
        category: '焦點二：常誤用字辨析',
      };
    } else {
      // Similar words from Focus 3
      const group = FOCUS_3_SIMILAR_WORDS[Math.floor(Math.random() * FOCUS_3_SIMILAR_WORDS.length)];
      const entry = group.entries[Math.floor(Math.random() * group.entries.length)];
      const options = shuffle(group.entries.map((e) => e.char));

      return {
        id: `q-sim-${group.id}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: group.id,
        type: 'confused_choice',
        prompt: `【形近字辨析】「${entry.meaning}」應對應下列哪個字？`,
        subPrompt: group.mnemonic ? `記憶口訣：『${group.mnemonic}』` : `詞例：${entry.example}`,
        options: options.slice(0, 4),
        correctAnswer: entry.char,
        correctIndex: options.slice(0, 4).indexOf(entry.char),
        explanation: `正確字為「${entry.char}」（${entry.zhuyin}）。【詞例】：${entry.example}。${group.mnemonic ? `【口訣】：${group.mnemonic}` : ''}`,
        category: '焦點三：形近字全集辨析',
      };
    }
  };

  // Helper generator 5: Classical particles & Loan words (Focus 8 & Focus 9)
  const makeClassicalQuestion = (): QuizQuestion => {
    if (Math.random() > 0.5 && FOCUS_8_CLASSICAL_PARTICLES.length > 0) {
      // Classical particle usage
      const item = FOCUS_8_CLASSICAL_PARTICLES[Math.floor(Math.random() * FOCUS_8_CLASSICAL_PARTICLES.length)];
      const usage = item.usages[Math.floor(Math.random() * item.usages.length)];
      const example = usage.examples[Math.floor(Math.random() * usage.examples.length)];
      const correct = usage.meaning;

      // Distractor usages from other usages of this particle or other particles
      const otherUsages = item.usages
        .filter((u) => u.meaning !== correct)
        .map((u) => u.meaning);

      const generalDistractors = [
        '連詞，表示轉折（然而、卻）',
        '代詞，指稱第三人稱（他、它）',
        '動詞，前往、到……去',
        '介詞，表示被動（被）',
        '介詞，引進比較對象（比、勝過）',
        '副詞，表示揣測（大概、恐怕）',
        '結構助詞，無義（賓語前置）',
      ];

      const options = shuffle([correct, ...otherUsages]);
      for (const d of shuffle(generalDistractors)) {
        if (options.length >= 4) break;
        if (!options.includes(d)) options.push(d);
      }

      return {
        id: `q-clas-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: item.id,
        type: 'classical_choice',
        prompt: `【文言虛詞辨析】請選出例句中「${item.char}」字的詞性與用法：`,
        subPrompt: `例句：「${example}」`,
        options: options.slice(0, 4),
        correctAnswer: correct,
        correctIndex: options.slice(0, 4).indexOf(correct),
        explanation: `在「${example}」中，「${item.char}」字用法為：【${correct}】。${item.mnemonic ? `記憶要領：${item.mnemonic}` : ''}`,
        category: '焦點八：文言虛詞與多義字辨析',
      };
    } else {
      // Loan words from Focus 9
      const item = FOCUS_9_LOAN_WORDS[Math.floor(Math.random() * FOCUS_9_LOAN_WORDS.length)];
      const example = item.examples[0] || `${item.originalChar}（例句）`;
      const isCharQuestion = Math.random() > 0.5;

      if (isCharQuestion) {
        const correct = item.targetChar;
        const distractors = ['悅', '早', '志', '披', '措', '貼', '囑', '惘', '俱', '無', '值', '返', '樽', '避', '按', '缺', '慧']
          .filter((c) => c !== correct);
        const options = shuffle([correct, ...shuffle(distractors).slice(0, 3)]);

        return {
          id: `q-loan-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
          sourceId: item.id,
          type: 'classical_choice',
          prompt: `【通假字辨析】「${example}」句中的「${item.originalChar}」字，通哪一個字？`,
          subPrompt: `出自：${item.source}；釋義：${item.meaning}（讀音：【${item.zhuyin}】）`,
          options,
          correctAnswer: correct,
          correctIndex: options.indexOf(correct),
          explanation: `「${example}」中「${item.originalChar}」通「${item.targetChar}」，讀作「${item.zhuyin}」，意思為「${item.meaning}」。${item.note || ''}`,
          category: '焦點九：重要通假字彙整',
        };
      } else {
        const correct = item.zhuyin;
        const options = shuffle([correct, ...shuffle(COMMON_ZHUYIN_POOL.filter((z) => z !== correct)).slice(0, 3)]);

        return {
          id: `q-loan-zhu-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
          sourceId: item.id,
          type: 'classical_choice',
          prompt: `【通假字讀音】「${example}」句中通假字「${item.originalChar}」（通「${item.targetChar}」）的審定讀音為何？`,
          subPrompt: `出自：${item.source}；字義：${item.meaning}`,
          options,
          correctAnswer: correct,
          correctIndex: options.indexOf(correct),
          explanation: `「${example}」中的「${item.originalChar}」通「${item.targetChar}」，讀作「${item.zhuyin}」，意思是「${item.meaning}」。`,
          category: '焦點九：重要通假字彙整',
        };
      }
    }
  };

  // Dispatch based on requested type
  for (let i = 0; i < count; i++) {
    let q: QuizQuestion | null = null;

    if (type === 'char_choice') {
      q = makeFocus1CharQuestion();
    } else if (type === 'zhuyin_choice') {
      q = makeZhuyinQuestion();
    } else if (type === 'meaning_choice') {
      q = makeMeaningQuestion();
    } else if (type === 'confused_choice') {
      q = makeConfusedQuestion();
    } else if (type === 'polyphonic_choice') {
      q = makePolyphonicQuestion();
    } else if (type === 'classical_choice') {
      q = makeClassicalQuestion();
    } else {
      // comprehensive: balanced mix
      const r = i % 6;
      if (r === 0) q = makeFocus1CharQuestion();
      else if (r === 1) q = makeZhuyinQuestion();
      else if (r === 2) q = makeConfusedQuestion();
      else if (r === 3) q = makePolyphonicQuestion();
      else if (r === 4) q = makeClassicalQuestion();
      else q = makeMeaningQuestion();
    }

    if (q) {
      questions.push(q);
    } else {
      // fallback
      questions.push(makeZhuyinQuestion());
    }
  }

  return questions;
};

