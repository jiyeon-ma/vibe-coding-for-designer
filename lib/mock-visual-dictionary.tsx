import type { VisualDictionaryItem } from "@/components/visual-dictionary-card";

/**
 * Visual Dictionary 가상 데이터.
 * 추후 DB(`db.visualDictionary.findMany()`) 결과로 교체.
 *
 * 검색 인덱스용으로 server·client 양쪽에서 공유한다.
 * heroOverlay에 JSX가 들어가므로 .tsx 확장자 유지.
 */
export const MOCK_VISUAL_DICTIONARY: VisualDictionaryItem[] = [
  {
    id: "glassmorphism",
    keyword: "Glassmorphism",
    vibeDescription:
      "반투명한 유리 패널이 떠 있는 듯한 무드. 백드롭 블러와 부드러운 가장자리 광택이 핵심.",
    heroStyle: {
      background:
        "radial-gradient(ellipse at 25% 20%, rgba(139,158,255,0.55) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(255,179,167,0.45) 0%, transparent 60%), linear-gradient(135deg, #1a1c2a 0%, #0f1011 100%)",
    },
    heroOverlay: (
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <div className="w-2/3 h-2/3 rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]" />
      </div>
    ),
    prompts: [
      {
        tool: "Midjourney",
        body: "frosted glass UI card floating on soft purple-blue gradient, depth of field, dreamy lighting, ultra-clean composition --ar 16:9 --style raw",
      },
      {
        tool: "CSS",
        body: "background: rgba(255,255,255,0.06);\nbackdrop-filter: blur(20px);\nborder: 1px solid rgba(255,255,255,0.1);\nborder-radius: 16px;",
      },
    ],
  },
  {
    id: "liquid-chrome",
    keyword: "Liquid Chrome",
    vibeDescription:
      "수은처럼 흐르는 반사 표면. Y2K 향수와 미래적 럭셔리가 동시에 느껴지는 무드.",
    heroStyle: {
      background:
        "radial-gradient(circle at 30% 30%, #f4f4f5 0%, #a1a1aa 35%, #52525b 70%, #1f1f23 100%)",
    },
    heroOverlay: (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[55%] aspect-square rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #ffffff 0%, #d4d4d8 25%, #71717a 60%, #27272a 100%)",
            boxShadow:
              "inset -10px -20px 40px rgba(0,0,0,0.5), 0 20px 60px -10px rgba(0,0,0,0.6)",
          }}
        />
      </div>
    ),
    prompts: [
      {
        tool: "Midjourney",
        body: "liquid chrome blob, hyperreal mercury reflections, octane render, soft studio lighting on white floor --ar 1:1",
      },
      {
        tool: "Three.js",
        body: "new THREE.MeshPhysicalMaterial({\n  metalness: 1.0,\n  roughness: 0.05,\n  clearcoat: 1.0,\n  envMapIntensity: 1.5,\n});",
      },
    ],
  },
  {
    id: "brutalist-type",
    keyword: "Brutalist Type",
    vibeDescription:
      "거대하고 날것의 타이포. 흑백 대비, 장식 없이 스케일과 위계만으로 구성.",
    heroStyle: {
      background: "var(--canvas)",
    },
    heroOverlay: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="text-[180px] md:text-[220px] font-black tracking-[-0.08em] text-ink leading-none select-none">
          Aa
        </span>
      </div>
    ),
    prompts: [
      {
        tool: "Midjourney",
        body: "swiss brutalist editorial poster, oversized helvetica display, monochrome, raw concrete background, harsh shadow --ar 3:4",
      },
      {
        tool: "Figma",
        body: "Inter Display 240px / weight 800 / tracking -0.06em / mix-blend-mode: difference",
      },
    ],
  },
  {
    id: "aurora-gradient",
    keyword: "Aurora Gradient",
    vibeDescription:
      "라벤더, 피치, 일렉트릭 블루가 자연스럽게 번지는 우주적 발광 무드.",
    heroStyle: {
      background:
        "radial-gradient(ellipse at 25% 20%, #8b9eff 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, #ffb3a7 0%, transparent 55%), radial-gradient(ellipse at 60% 50%, #5e6ad2 0%, transparent 60%), #0a0a14",
    },
    prompts: [
      {
        tool: "Midjourney",
        body: "soft aurora sky gradient, lavender peach electric blue, smooth seamless blend, dreamy haze --ar 16:9 --style raw",
      },
      {
        tool: "CSS",
        body: "background:\n  radial-gradient(ellipse at 30% 20%, #8b9eff 0%, transparent 50%),\n  radial-gradient(ellipse at 70% 80%, #ffb3a7 0%, transparent 50%),\n  #5e6ad2;",
      },
    ],
  },
];
