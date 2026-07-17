import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 集中注册 GSAP 插件，避免各模块重复 import + registerPlugin
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
