// Stub TypeScript declarations for motion/react
// motion v12+ re-exporte depuis framer-motion.
// Ce stub couvre les exports utilisés dans le projet.

declare module 'motion/react' {
  import * as React from 'react';

  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    initial?: boolean;
    exitBeforeEnter?: boolean;
    onExitComplete?: () => void;
    custom?: any;
    mode?: 'sync' | 'popLayout' | 'wait';
  }
  export const AnimatePresence: React.FC<AnimatePresenceProps>;

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileInView?: any;
    variants?: any;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    layout?: boolean | string;
    layoutId?: string;
    drag?: boolean | 'x' | 'y';
    dragConstraints?: any;
    onAnimationComplete?: () => void;
    [key: string]: any;
  }

  type MotionComponentProps = MotionProps & React.HTMLAttributes<HTMLElement>;

  export const motion: {
    div: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLDivElement>>;
    span: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLSpanElement>>;
    button: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLButtonElement>>;
    p: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLParagraphElement>>;
    h1: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h2: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h3: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h4: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLHeadingElement>>;
    ul: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLUListElement>>;
    li: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLLIElement>>;
    section: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLElement>>;
    article: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLElement>>;
    aside: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLElement>>;
    header: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLElement>>;
    footer: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLElement>>;
    img: React.FC<MotionComponentProps & React.HTMLAttributes<HTMLImageElement>>;
    svg: React.FC<MotionComponentProps & React.SVGAttributes<SVGElement>>;
    path: React.FC<MotionComponentProps & React.SVGAttributes<SVGPathElement>>;
    [key: string]: React.FC<any>;
  };

  export const m: typeof motion;

  export function useAnimation(): any;
  export function useMotionValue(initial: number): any;
  export function useTransform(value: any, inputRange: number[], outputRange: any[]): any;
  export function useSpring(value: any, config?: any): any;
  export function useScroll(options?: any): any;
  export function useInView(ref: any, options?: any): boolean;
  export function animate(target: any, keyframes: any, options?: any): any;
  export function stagger(duration: number, options?: any): any;
}
