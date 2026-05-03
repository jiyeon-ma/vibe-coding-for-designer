/**
 * Vibe Archive — Motion Tokens
 *
 * 원칙 (plan.md §모션 가이드):
 * - Linear/Apple-style 절제된 모션. 통통 튀는 spring 금지.
 * - 모든 mount/unmount는 fade 동반.
 * - 95% 케이스는 ease.out + duration.base.
 */

export const ease = {
  /** out-expo. 표준. 95% 케이스 이걸로 */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** 섹션 전환, 중간 화면 이동 */
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** 페이지 전환 (Apple-style) */
  smooth: [0.32, 0.72, 0, 1] as [number, number, number, number],
} as const;

export const duration = {
  /** hover, 색 변화, focus ring */
  fast: 0.15,
  /** 카드 hover lift, 작은 transform */
  base: 0.25,
  /** archive/delete, 모달 open/close */
  medium: 0.4,
  /** 페이지 mount, 섹션 진입 */
  slow: 0.6,
} as const;

/** 통통 튐 거의 없는 spring (damping 28). Linear-style. */
export const springSoft = {
  type: "spring" as const,
  damping: 28,
  stiffness: 280,
  mass: 0.8,
} as const;

/** 카드 mount용 — opacity 0→1 + y 8→0, stagger 가능 */
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.base, ease: ease.out },
} as const;

/** 카드 hover lift */
export const hoverLift = {
  whileHover: { y: -2, scale: 1.005 },
  transition: { duration: duration.base, ease: ease.out },
} as const;

/** 모달 open */
export const modalIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: duration.medium, ease: ease.out },
} as const;

/** Archive 스와이프 */
export const swipeOut = {
  exit: { x: 320, opacity: 0 },
  transition: { duration: duration.medium, ease: ease.out },
} as const;
