import { CROP_CLASSIFICATION } from './cropClassification'

const { crops, categories, aliases } = CROP_CLASSIFICATION

// 所有可供自動完成的名稱（作物 + 次分類 + 別名）
export const CROP_NAMES = [
  ...Object.keys(crops),
  ...Object.keys(categories),
  ...Object.keys(aliases),
].sort()

function format(entry) {
  return [entry.cat1, entry.cat2, entry.family].filter(Boolean).join(' > ')
}

function paths(list) {
  return list.map(e => ({ ...e, text: format(e) }))
}

/**
 * 依名稱查詢分類歸屬。
 * 比對順序：作物完全相符 → 別名 → 次分類完全相符 → 作物名包含關鍵字。
 * 回傳 { name, paths: [{ cat1, cat2, family, text }] } 或 null。
 */
export function lookupCrop(name) {
  const key = (name || '').trim()
  if (!key) return null

  if (crops[key]) return { name: key, paths: paths(crops[key]) }

  const aliased = aliases[key]
  if (aliased && crops[aliased]) return { name: aliased, paths: paths(crops[aliased]) }

  if (categories[key]) return { name: key, paths: paths(categories[key]) }

  // 包含式比對：輸入含作物名（例「牛番茄」含「番茄」），或作物名含輸入
  const partial = Object.keys(crops).find(c => key.includes(c) || c.includes(key))
  if (partial) return { name: partial, paths: paths(crops[partial]) }

  return null
}
