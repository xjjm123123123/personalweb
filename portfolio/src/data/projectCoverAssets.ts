export type ResponsiveProjectCover = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

const PROJECT_CARD_SIZES =
  "(min-width: 1536px) 32rem, (min-width: 1024px) 28rem, (min-width: 768px) 46vw, calc(100vw - 3rem)";

const RESPONSIVE_PROJECT_COVERS: Record<string, ResponsiveProjectCover> = {
  "/image/Group 37427.png": {
    src: "/image/optimized/guokebang-cover-1280.webp",
    srcSet:
      "/image/optimized/guokebang-cover-640.webp 640w, /image/optimized/guokebang-cover-1280.webp 1280w",
    sizes: PROJECT_CARD_SIZES,
  },
  "/image/Mask group.png": {
    src: "/image/optimized/plastic-ocean-cover-1280.webp",
    srcSet:
      "/image/optimized/plastic-ocean-cover-640.webp 640w, /image/optimized/plastic-ocean-cover-1280.webp 1280w",
    sizes: PROJECT_CARD_SIZES,
  },
  "/image/dongpo-fantasy-cover.png": {
    src: "/image/optimized/dongpo-fantasy-cover-1280.webp",
    srcSet:
      "/image/optimized/dongpo-fantasy-cover-640.webp 640w, /image/optimized/dongpo-fantasy-cover-1280.webp 1280w",
    sizes: PROJECT_CARD_SIZES,
  },
  "/image/Mask group2.png": {
    src: "/image/optimized/yongzhi-journey-cover-1280.webp",
    srcSet:
      "/image/optimized/yongzhi-journey-cover-640.webp 640w, /image/optimized/yongzhi-journey-cover-1280.webp 1280w",
    sizes: PROJECT_CARD_SIZES,
  },
  "/image/coverimg.png": {
    src: "/image/optimized/lunanest-cover-1280.webp",
    srcSet:
      "/image/optimized/lunanest-cover-640.webp 640w, /image/optimized/lunanest-cover-1280.webp 1280w",
    sizes: PROJECT_CARD_SIZES,
  },
  "/image/Rectangle.png": {
    src: "/image/optimized/northeast-news-cover-1280.webp",
    srcSet:
      "/image/optimized/northeast-news-cover-640.webp 640w, /image/optimized/northeast-news-cover-1280.webp 1280w",
    sizes: PROJECT_CARD_SIZES,
  },
};

export function getResponsiveProjectCover(image?: string): ResponsiveProjectCover {
  if (!image) {
    return { src: "" };
  }

  return RESPONSIVE_PROJECT_COVERS[image] ?? { src: image };
}
