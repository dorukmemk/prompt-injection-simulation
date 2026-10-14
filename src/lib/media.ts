/**
 * İzlenecek ve uygulanacak dış kaynaklar.
 * Her bağlantı yayımlanmadan önce açılarak doğrulanmıştır (bkz. CONTRIBUTING.md).
 */

export interface MediaItem {
  id: string
  kind: 'izle' | 'pratik' | 'oku' | 'araç'
  title: string
  by: string
  note: string
  url: string
  /** YouTube video kimliği — varsa sayfa içinde oynatılır */
  youtube?: string
  minutes?: string
  level: 'başlangıç' | 'orta' | 'ileri'
}

export const MEDIA: MediaItem[] = [
  {
    id: 'gandalf',
    kind: 'pratik',
    title: 'Gandalf — istem enjeksiyonu oyunu',
    by: 'Lakera',
    note: 'Seviyeleri giderek sertleşen bir yapay zekâdan parolayı almaya çalışırsınız. Savunmaların neden yetmediğini yaparak öğrenmenin en hızlı yolu.',
    url: 'https://gandalf.lakera.ai/',
    level: 'başlangıç',
  },
  {
    id: 'rehberger-nahamcon',
    kind: 'izle',
    title: 'SpAIware’den Terminal DiLLMa’ya — enjeksiyon istismarları ve çözümleri',
    by: 'Johann Rehberger (NahamCon, Mayıs 2025)',
    note: 'Gerçek sistemlerde bulunmuş zafiyetlerin canlı gösterimi: hafızaya kalıcı talimat yazma, terminal çıktısıyla komut çalıştırma ve bunların nasıl kapatıldığı. Saldırının teoride değil pratikte nasıl göründüğünü görmek için en iyi kayıt.',
    url: 'https://www.youtube.com/watch?v=0EHok_Bpn2w',
    youtube: '0EHok_Bpn2w',
    minutes: '~45 dk',
    level: 'orta',
  },
  {
    id: 'rehberger-agentic',
    kind: 'izle',
    title: 'Agentic ProbLLMs — bilgisayar kullanan ve kod yazan ajanları istismar etmek',
    by: 'Johann Rehberger (2025)',
    note: 'Ajan mimarilerine özgü riskler: kod çalıştırabilen veya kendi güvenlik ayarlarını değiştirebilen ajanlarda dolaylı enjeksiyonun etkisi. 6. modülü izledikten sonra izlemek en verimlisi.',
    url: 'https://www.youtube.com/watch?v=-HL0dDhCahk',
    youtube: '-HL0dDhCahk',
    minutes: '~40 dk',
    level: 'ileri',
  },
  {
    id: 'swillison-explained',
    kind: 'izle',
    title: 'Prompt injection explained',
    by: 'Simon Willison',
    note: 'Terimi yaygınlaştıran kişinin anlatımı: ne olduğu, neden ciddi olduğu ve önerilen çözümlerin çoğunun neden yetersiz kaldığı. Yazı ve video birlikte.',
    url: 'https://simonwillison.net/2023/may/2/prompt-injection-explained/',
    minutes: '~20 dk',
    level: 'başlangıç',
  },
  {
    id: 'redmonk',
    kind: 'izle',
    title: 'Sektörün geç kalan yanıtı üzerine söyleşi',
    by: 'RedMonk × Simon Willison',
    note: 'Prompt injection’ın neden bir içerik denetimi değil güvenlik sorunu olduğu; "yarıçapı daralt" yaklaşımı.',
    url: 'https://redmonk.com/videos/a-redmonk-conversation-simon-willison-on-industrys-tardy-response-to-the-ai-prompt-injection-vulnerability/',
    minutes: '~30 dk',
    level: 'orta',
  },
  {
    id: 'owasp-hub',
    kind: 'oku',
    title: 'OWASP Top 10 for LLM Applications',
    by: 'OWASP GenAI Security Project',
    note: 'LLM uygulamaları için risk sıralamasının tamamı ve LLM01 için yedi başlıkta önleme stratejisi.',
    url: 'https://genai.owasp.org/llm-top-10/',
    level: 'orta',
  },
  {
    id: 'atlas-hub',
    kind: 'araç',
    title: 'MITRE ATLAS matrisi',
    by: 'MITRE',
    note: 'Saldırı tekniklerinin ve azaltımların ortak dili. Rapor yazarken teknik kimlikleriyle atıf vermek için.',
    url: 'https://atlas.mitre.org/',
    level: 'orta',
  },
  {
    id: 'nist-hub',
    kind: 'oku',
    title: 'NIST AI 100-2 E2025 — Adversarial Machine Learning',
    by: 'NIST',
    note: 'Saldırı ve azaltımların standart terminolojiyle sınıflandırması. Akademik ve kurumsal raporlarda ortak dil.',
    url: 'https://csrc.nist.gov/pubs/ai/100/2/e2025/final',
    level: 'ileri',
  },
  {
    id: 'camel-paper',
    kind: 'oku',
    title: 'Defeating Prompt Injections by Design (CaMeL)',
    by: 'Debenedetti vd., 2025',
    note: 'Güvenilmeyen veriden türeyen değerlerin yetki taşımadığı bir tasarım deseni. Köken takibini ciddiye alan en net öneri.',
    url: 'https://arxiv.org/abs/2503.18813',
    level: 'ileri',
  },
  {
    id: 'agentdojo-paper',
    kind: 'araç',
    title: 'AgentDojo — kıyas ortamı',
    by: 'Debenedetti vd., 2024',
    note: 'Ajan senaryolarında saldırı ve savunmaları ölçmek için dinamik kıyas ortamı.',
    url: 'https://arxiv.org/abs/2406.13352',
    level: 'ileri',
  },
]
