import type { TechNote } from './types'
import { note1Stack } from './note1-stack'
import { note2ListCreation } from './note2-list-creation'
import { note3Camera } from './note3-camera'
import { note4Api } from './note4-api'

// 「WMS 技術メモ」の登録簿。ここに足すと目次・サイドバーに自動で並ぶ。
export const techNotes: TechNote[] = [
  note1Stack,
  note2ListCreation,
  note3Camera,
  note4Api,
]

export function getTechNote(id: string): TechNote | undefined {
  return techNotes.find((n) => n.id === id)
}

export const techNoteList = techNotes.map((n) => ({ id: n.id, num: n.num, title: n.title }))
