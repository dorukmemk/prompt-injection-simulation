import type { AppId, Scenario } from '../types'
import { mailExfil } from './mail-exfil'
import { webRender } from './web-render'
import { agentChain } from './agent-chain'
import { directJailbreak } from './direct-jailbreak'
import { codeRce } from './code-rce'
import { memoryPersist } from './memory-persist'
import { ragPoison } from './rag-poison'

/**
 * Senaryo kaydı. Yeni senaryo eklemek için kendi dosyasını yazıp
 * bu diziye eklemek yeterlidir — başka hiçbir yere dokunulmaz.
 */
export const SCENARIOS: Scenario[] = [
  mailExfil,
  webRender,
  agentChain,
  codeRce,
  memoryPersist,
  ragPoison,
  directJailbreak,
]

export const SCENARIO_MAP = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]))

export function scenariosForApp(app: AppId): Scenario[] {
  return SCENARIOS.filter((s) => s.app === app)
}
