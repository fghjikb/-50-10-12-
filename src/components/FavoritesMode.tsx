import React from 'react';
import {
  Star,
  Volume2,
  Trash2,
  BookOpen,
} from 'lucide-react';
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
import { speakText } from '../utils/speech';

interface FavoritesModeProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onGoToReview: () => void;
}

export const FavoritesMode: React.FC<FavoritesModeProps> = ({
  favorites,
  onToggleFavorite,
  onGoToReview,
}) => {
  // Collect all favorited items
  const favFocus1 = FOCUS_1_ERROR_WORDS.filter((item) => favorites.includes(item.id));
  const favFocus2 = FOCUS_2_CONFUSED_WORDS.filter((item) => favorites.includes(item.id));
  const favFocus3 = FOCUS_3_SIMILAR_WORDS.filter((group) => favorites.includes(group.id));
  const favFocus4 = FOCUS_4_IDIOM_PHONETICS.filter((item) => favorites.includes(item.id));
  const favFocus5 = FOCUS_5_FOOD_PHONETICS.filter((item) => favorites.includes(item.id));
  const favFocus6 = FOCUS_6_POLYPHONIC_WORDS.filter((item) => favorites.includes(item.id));
  const favFocus7 = FOCUS_7_LIFE_PHONETICS.filter((item) => favorites.includes(item.id));
  const favFocus8 = FOCUS_8_CLASSICAL_PARTICLES.filter((item) => favorites.includes(item.id));
  const favFocus9 = FOCUS_9_LOAN_WORDS.filter((item) => favorites.includes(item.id));

  const totalFavs =
    favFocus1.length +
    favFocus2.length +
    favFocus3.length +
    favFocus4.length +
    favFocus5.length +
    favFocus6.length +
    favFocus7.length +
    favFocus8.length +
    favFocus9.length;

  if (totalFavs === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Star className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">
          目前尚未收藏任何字詞
        </h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          在課文複習或字卡模式中，點擊星星 ⭐ 即可加入收藏，方便考前快速重點衝刺！
        </p>
        <button
          onClick={onGoToReview}
          className="mt-4 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-xs text-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>前往課文挑選收藏</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              我的考前重點收藏夾
            </h2>
            <p className="text-xs text-stone-500">
              共收藏 {totalFavs} 個重點項目
            </p>
          </div>
        </div>
      </div>

      {/* Focus 1 favorites */}
      {favFocus1.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            焦點一：易寫錯的字與釋義 ({favFocus1.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favFocus1.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-serif-tc text-stone-900">
                      {item.fullPhrase}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-serif-tc">
                      {item.zhuyin}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakText(item.fullPhrase)}
                      className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                      title="移除收藏"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded-xl">
                  {item.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus 2 favorites */}
      {favFocus2.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            焦點二：常誤用字辨析 ({favFocus2.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favFocus2.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg font-serif-tc text-amber-900">
                    【{item.chars.join(' vs ')}】
                  </div>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs space-y-1.5 text-stone-700">
                  {item.examples.map((ex, i) => (
                    <div key={i}>
                      <strong className="text-stone-900">【{ex.char}】：</strong>
                      {ex.phrase}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus 4 & 5 favorites */}
      {(favFocus4.length > 0 || favFocus5.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            焦點四與五：成語與料理讀音 ({favFocus4.length + favFocus5.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favFocus4.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-serif-tc text-stone-900">
                    {item.phrase}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-serif-tc">
                      「{item.targetChar}」{item.zhuyin}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.explanation && (
                  <p className="text-xs text-stone-600">{item.explanation}</p>
                )}
              </div>
            ))}

            {favFocus5.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-serif-tc text-stone-900">
                    {item.foodName}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-serif-tc">
                      「{item.targetChar}」{item.zhuyin}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.note && (
                  <p className="text-xs text-stone-600">{item.note}</p>
                )}
              </div>
            ))}

            {favFocus6.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-serif-tc text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg">
                      {item.char}
                    </span>
                    <span className="text-sm font-bold text-stone-800">
                      一字多音解析
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {item.readings.map((r, rIdx) => (
                    <div key={rIdx} className="bg-stone-50 p-1.5 rounded-md text-stone-700">
                      <span className="font-bold text-amber-800 mr-1.5">【{r.zhuyin}】</span>
                      <span>{r.examples.join('、')}（{r.meaning}）</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {favFocus7.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-serif-tc text-stone-900">
                    {item.phrase}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-serif-tc">
                      「{item.targetChar}」{item.zhuyin}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.note && (
                  <p className="text-xs text-stone-600">{item.note}</p>
                )}
              </div>
            ))}

            {favFocus8.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-serif-tc text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-xl">
                      {item.char}
                    </span>
                    <span className="text-sm font-bold text-stone-800">
                      文言虛詞「{item.char}」
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  {item.usages.slice(0, 3).map((u, uIdx) => (
                    <div key={uIdx} className="bg-stone-50 p-1.5 rounded-lg">
                      <span className="font-bold text-amber-800">▪ {u.meaning}：</span>
                      <span>{u.examples[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {favFocus9.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-serif-tc text-stone-900">
                      「{item.originalChar}」通「{item.targetChar}」
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-serif-tc">
                      【{item.zhuyin}】
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1 text-amber-500 hover:text-stone-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-600 font-serif-tc">
                  {item.examples[0]}（{item.source}）
                </p>
                <p className="text-[11px] text-stone-500">釋義：{item.meaning}</p>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
};
