import { pinyin } from 'pinyin-pro';

// 将标题转为 URL slug：中文转拼音，英文小写，非字母数字字符转 -
// 例："星空银河之旅" -> "xing-kong-yin-he-zhi-lv"
// 例："Silent Ridge 2024" -> "silent-ridge-2024"
export function titleToSlug(title: string): string {
  if (!title) return '';

  // 中文转拼音（无声调、数组形式，用 - 连接多字）
  const pinyinStr = pinyin(title, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  }).join('-');

  return pinyinStr
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
