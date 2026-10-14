import {
  BookOpen,
  Bot,
  Compass,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  Settings2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WinId } from '@/store/useApp'

export interface AppMeta {
  id: WinId
  name: string
  icon: LucideIcon
  accent: string
  w: number
  h: number
  dock: boolean
}

export const APPS: AppMeta[] = [
  { id: 'mail', name: 'Posta Asistanı', icon: Mail, accent: '#1f6feb', w: 940, h: 620, dock: true },
  { id: 'browser', name: 'Pusula', icon: Compass, accent: '#12a594', w: 980, h: 640, dock: true },
  { id: 'agent', name: 'Ajan Konsolu', icon: Bot, accent: '#e07b1c', w: 960, h: 640, dock: true },
  { id: 'chat', name: 'Asistan', icon: MessageSquare, accent: '#10a37f', w: 1180, h: 760, dock: true },
  {
    id: 'academy',
    name: 'Akademi',
    icon: GraduationCap,
    accent: '#8e5cf6',
    w: 1080,
    h: 720,
    dock: true,
  },
  { id: 'library', name: 'Kaynaklar', icon: BookOpen, accent: '#e0a82e', w: 960, h: 650, dock: true },
  { id: 'settings', name: 'Ayarlar', icon: Settings2, accent: '#6b6b74', w: 640, h: 520, dock: true },
  { id: 'docs', name: 'Belge', icon: FileText, accent: '#c9c9d8', w: 900, h: 600, dock: false },
]

export const APP_MAP = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<WinId, AppMeta>
