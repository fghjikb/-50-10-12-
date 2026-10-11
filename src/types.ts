export interface ErrorWordItem {
  id: string;
  category: string; // 注音聲母，如 'ㄅ', 'ㄆ', ...
  targetChar: string; // 正確字
  fullPhrase: string; // 完整詞語，如 '大展抱負'
  charWithParens: string; // 挖空/括號表示，如 '大展(抱)負'
  zhuyin: string; // 注音，如 'ㄅㄠˋ'
  meaning: string; // 釋義，如 '胸懷、志趣'
  commonMistake?: string; // 常錯字，如 '暴'
  isFrequent?: boolean; // 橘子/柿子常考標記
  notes?: string;
}

export interface ConfusedWordGroup {
  id: string;
  number: number;
  chars: string[]; // 如 ['密', '蜜']
  examples: {
    char: string;
    phrase: string;
    explanation?: string;
  }[];
  isFrequent?: boolean;
}

export interface SimilarWordEntry {
  char: string;
  zhuyin: string;
  meaning: string;
  example: string;
  annotation?: string;
}

export interface SimilarWordGroup {
  id: string;
  number: number;
  mnemonic?: string; // 口訣，如 '橫戌點戍戊中空，十字交叉便是戎'
  entries: SimilarWordEntry[];
  isFrequent?: boolean;
}

export interface IdiomPhoneticItem {
  id: string;
  phrase: string; // 如 '圖窮匕現'
  targetChar: string; // '匕'
  zhuyin: string; // 'ㄅㄧˇ'
  section: 'general' | 'frequently_misread'; // P.171 或 P.172
  category?: string; // ㄅ, ㄆ, ...
  isFrequent?: boolean;
  explanation?: string;
}

export interface FoodPhoneticItem {
  id: string;
  number: number;
  foodName: string; // '汆燙'
  targetChar: string; // '汆'
  zhuyin: string; // 'ㄘㄨㄢ'
  fullZhuyin?: string;
  note?: string;
}

export interface PolyphonicReading {
  zhuyin: string;
  meaning: string;
  examples: string[];
}

export interface PolyphonicWordItem {
  id: string;
  char: string; // 如 '咽'
  readings: PolyphonicReading[];
  isFrequent?: boolean;
  mnemonic?: string;
}

export interface LifePhoneticItem {
  id: string;
  phrase: string; // 如 '龜裂'
  targetChar: string; // '龜'
  zhuyin: string; // 'ㄐㄩㄣ'
  category: 'daily' | 'proper_noun' | 'nature' | 'medical';
  note?: string;
  isFrequent?: boolean;
}

export interface ClassicalParticleUsage {
  meaning: string; // 義項與詞性，如「連詞，表示轉折，然而、卻」
  examples: string[]; // 例句，如「人不知而不慍」、「出淤泥而不染」
  explanation?: string;
}

export interface ClassicalParticleItem {
  id: string;
  char: string; // 如 '而', '之', '其', '以', '於', '為', '乃', '與'
  isFrequent?: boolean;
  mnemonic?: string; // 記憶口訣或核心要領
  usages: ClassicalParticleUsage[];
}

export interface LoanWordItem {
  id: string;
  originalChar: string; // 本字/借字，如 '說'
  targetChar: string; // 通用字/正字，如 '悅'
  zhuyin: string; // 注音，如 'ㄩㄝˋ'
  meaning: string; // 意思，如 '喜悅、高興'
  examples: string[]; // 出處例句，如 '學而時習之，不亦說乎'
  source: string; // 典籍，如 '論語'
  isFrequent?: boolean;
  note?: string;
}

export type StudyCategory = 
  | 'all'
  | 'error_words'          // 重點一：易錯字與釋義
  | 'confused_words'       // 重點二：常誤用字辨別
  | 'similar_words'        // 重點三：形近字全集
  | 'idioms_phonetic'      // 重點四：成語字音字形
  | 'food_phonetic'        // 重點五：美食料理讀音
  | 'polyphonic_words'     // 重點六：一字多音破音字
  | 'life_phonetic'        // 重點七：生活常讀錯字
  | 'classical_particles'  // 重點八：文言虛詞與多義字
  | 'loan_words'           // 重點九：重要通假字彙整
  | 'favorites'            // 我的收藏
  | 'mistakes';            // 錯題筆記本

export type QuizType = 
  | 'char_choice'          // 國字選擇 (大展__負)
  | 'zhuyin_choice'        // 注音選擇 (「汆」燙的讀音)
  | 'meaning_choice'       // 釋義配對 (「走板」的意思)
  | 'confused_choice'      // 常誤用字/形近字挑錯辨析
  | 'polyphonic_choice'    // 一字多音破音字辨析
  | 'classical_choice'     // 文言虛詞與通假字辨析
  | 'comprehensive';       // 綜合會考大模擬 (隨機綜合)
