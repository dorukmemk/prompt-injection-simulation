import type { Reference } from './types'

/**
 * Yalnızca doğrulanmış birincil kaynaklar.
 * Buraya bir kayıt eklenmeden önce başlık, kurum, yıl ve URL kontrol edilmelidir.
 * Uydurma kaynak eklemek bu projede kabul edilmez (bkz. CONTRIBUTING.md).
 */
export const REFERENCES: Reference[] = [
  {
    id: 'owasp-llm01',
    kind: 'standart',
    org: 'OWASP GenAI Security Project',
    title: 'LLM01:2025 Prompt Injection — OWASP Top 10 for LLM Applications',
    year: '2025',
    url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/',
    note:
      'Prompt injection’ı LLM uygulamalarındaki 1 numaralı risk olarak tanımlar; yedi başlıkta önleme stratejisi listeler.',
  },
  {
    id: 'owasp-top10',
    kind: 'standart',
    org: 'OWASP GenAI Security Project',
    title: 'OWASP Top 10 for Large Language Model Applications',
    year: '2025',
    url: 'https://genai.owasp.org/llm-top-10/',
    note: 'LLM uygulamaları için risk sıralamasının tamamı.',
  },
  {
    id: 'atlas',
    kind: 'taksonomi',
    org: 'MITRE ATLAS',
    title: 'AML.T0051 — LLM Prompt Injection (alt teknikler: .000 Direct, .001 Indirect, .002 Triggered)',
    year: '2025',
    url: 'https://atlas.mitre.org/',
    note:
      'Saldırganın istemi doğrudan mı (kullanıcı olarak) yoksa dolaylı mı (modelin okuduğu veri üzerinden) verdiğini ayırır.',
  },
  {
    id: 'atlas-t0053',
    kind: 'taksonomi',
    org: 'MITRE ATLAS',
    title: 'AML.T0053 — AI Agent Tool Invocation',
    year: '2025',
    url: 'https://atlas.mitre.org/',
    note:
      'Saldırganın, ajanın erişimi olan araçları kendi amacı için çağırması. Yetki yükseltmenin temel adımı.',
  },
  {
    id: 'atlas-t0054',
    kind: 'taksonomi',
    org: 'MITRE ATLAS',
    title: 'AML.T0054 — LLM Jailbreak',
    year: '2025',
    url: 'https://atlas.mitre.org/',
    note:
      'Modelin güvenlik davranışlarını ve korkuluklarını aşma. Prompt injection’dan ayrı bir teknik olarak listelenir.',
  },
  {
    id: 'atlas-t0057',
    kind: 'taksonomi',
    org: 'MITRE ATLAS',
    title: 'AML.T0057 — LLM Data Leakage',
    year: '2025',
    url: 'https://atlas.mitre.org/',
    note: 'Modelin, bağlı olduğu veri kaynaklarındaki hassas bilgiyi dışarı vermesi.',
  },
  {
    id: 'atlas-t0077',
    kind: 'taksonomi',
    org: 'MITRE ATLAS',
    title: 'AML.T0077 — LLM Response Rendering',
    year: '2025',
    url: 'https://atlas.mitre.org/',
    note:
      'Yanıtın istemci tarafında işlenmesiyle veri sızdırma: markdown/HTML görsel etiketi tıklama gerektirmeden saldırgan sunucusuna istek atar.',
  },
  {
    id: 'nist-aml',
    kind: 'standart',
    org: 'NIST',
    title:
      'NIST AI 100-2 E2025 — Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations',
    year: 'Mart 2025',
    url: 'https://csrc.nist.gov/pubs/ai/100/2/e2025/final',
    note:
      'Vassilev, Oprea, Fordyce, Anderson, Davies, Hamin. Üretken yapay zekâ saldırılarını (doğrudan/dolaylı istem enjeksiyonu dâhil) standart terminolojiyle sınıflandırır.',
  },
  {
    id: 'nist-rmf',
    kind: 'kilavuz',
    org: 'NIST',
    title: 'NIST AI 100-1 — AI Risk Management Framework (AI RMF 1.0)',
    year: '2023',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework',
    note: 'Yönet–Eşle–Ölç–Yönet döngüsü; kurumsal risk yönetimi çerçevesi.',
  },
  {
    id: 'greshake',
    kind: 'akademik',
    org: 'Greshake, Abdelnabi, Mishra, Endres, Holz, Fritz (AISec ’23)',
    title:
      'Not what you’ve signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection',
    year: '2023',
    url: 'https://arxiv.org/abs/2302.12173',
    note:
      'Dolaylı istem enjeksiyonunu sistematik olarak tanımlayan temel çalışma. Web ve e-posta üzerinden gerçek entegrasyonlara saldırı gösterir.',
  },
  {
    id: 'instr-hier',
    kind: 'akademik',
    org: 'Wallace, Xiao, Leike, Weng, Heidecke, Beutel (OpenAI)',
    title: 'The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions',
    year: '2024',
    url: 'https://arxiv.org/abs/2404.13208',
    note:
      'Sistem / kullanıcı / araç çıktısı talimatları arasında eğitimle yetki hiyerarşisi kurma önerisi. Simülasyondaki “yetki şeritleri” bu fikre dayanır.',
  },
  {
    id: 'spotlighting',
    kind: 'akademik',
    org: 'Hines, Lopez, Hall, Zarfati, Zunger, Kiciman (Microsoft)',
    title: 'Defending Against Indirect Prompt Injection Attacks With Spotlighting',
    year: '2024',
    url: 'https://arxiv.org/abs/2403.14720',
    note:
      'Güvenilmeyen içeriği sınırlayıcılarla, imlemeyle veya kodlamayla işaretleyerek “bu veridir, talimat değildir” sinyalini güçlendirme.',
  },
  {
    id: 'camel',
    kind: 'akademik',
    org: 'Debenedetti, Shumailov, Fan, Hayes, Carlini, Fabian, Kern, Shi, Terzis, Tramèr',
    title: 'Defeating Prompt Injections by Design (CaMeL)',
    year: '2025',
    url: 'https://arxiv.org/abs/2503.18813',
    note:
      'Güvenilmeyen veriden türeyen değerlerin yetki taşımadığı, denetim akışının ayrı bir güvenilir bileşende tutulduğu tasarım deseni.',
  },
  {
    id: 'agentdojo',
    kind: 'akademik',
    org: 'Debenedetti, Zhang, Balunović, Beurer-Kellner, Fischer, Tramèr',
    title:
      'AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.13352',
    note: 'Ajan senaryolarında saldırı ve savunmaları ölçmek için kıyas ortamı.',
  },
  {
    id: 'injecagent',
    kind: 'akademik',
    org: 'Zhan, Liang, Ying, Kang',
    title:
      'InjecAgent: Benchmarking Indirect Prompt Injections in Tool-Integrated Large Language Model Agents',
    year: '2024',
    url: 'https://arxiv.org/abs/2403.02691',
    note: 'Araç kullanan ajanlarda dolaylı enjeksiyonun başarı oranlarını ölçer.',
  },
  {
    id: 'echoleak',
    kind: 'olay',
    org: 'MITRE CVE / Microsoft',
    title: 'CVE-2025-32711 — M365 Copilot Information Disclosure Vulnerability (“EchoLeak”)',
    year: '11 Haziran 2025',
    url: 'https://www.cve.org/CVERecord?id=CVE-2025-32711',
    note:
      'Resmî kayıt: “Ai command injection in M365 Copilot allows an unauthorized attacker to disclose information over a network.” Hazırlanmış tek bir e-postayla, kullanıcı etkileşimi gerekmeden kurum içi verinin dışarı çıkarılabildiği dolaylı enjeksiyon zinciri.',
  },
  {
    id: 'cve-copilot-rce',
    kind: 'olay',
    org: 'MITRE CVE / Microsoft',
    title:
      'CVE-2025-53773 — GitHub Copilot and Visual Studio Remote Code Execution Vulnerability',
    year: '12 Ağustos 2025',
    url: 'https://www.cve.org/CVERecord?id=CVE-2025-53773',
    note:
      'Resmî kayıt: komut enjeksiyonu yoluyla yerel kod çalıştırma. Enjeksiyonun yalnızca veri sızdırmakla kalmayıp kod çalıştırmaya kadar gidebildiğini gösteren kayıt.',
  },
  {
    id: 'cve-windsurf',
    kind: 'olay',
    org: 'MITRE CVE / Windsurf',
    title: 'CVE-2025-62353 — Windsurf IDE yol aşımı (dolaylı enjeksiyonla tetiklenebilir)',
    year: '17 Ekim 2025',
    url: 'https://www.cve.org/CVERecord?id=CVE-2025-62353',
    note:
      'Resmî kayıt: tüm sürümlerde, proje dışındaki dosyaların okunup yazılmasına izin veren yol aşımı. Kayıtta açıkça belirtiliyor: “The vulnerability can be reached directly and through indirect prompt injection.”',
  },
]

export const REF_MAP = Object.fromEntries(REFERENCES.map((r) => [r.id, r]))

export function refsOf(ids: string[] | undefined): Reference[] {
  if (!ids) return []
  return ids.map((id) => REF_MAP[id]).filter(Boolean)
}
