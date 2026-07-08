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

const RESPONSIVE_PROJECT_COVER_MATCHERS: Array<{
  match: (image: string) => boolean;
  asset: ResponsiveProjectCover;
}> = [
  {
    match: (image) =>
      image.includes("/projects/guokebang-ai-agent/cover/") || image.includes("group-37427"),
    asset: RESPONSIVE_PROJECT_COVERS["/image/Group 37427.png"],
  },
  {
    match: (image) =>
      image.includes("/projects/plastic-ocean-vr/cover/") || image.includes("mask-group-"),
    asset: RESPONSIVE_PROJECT_COVERS["/image/Mask group.png"],
  },
  {
    match: (image) =>
      image.includes("/projects/dongpo-fantasy-vr/cover/") || image.includes("dongpo-fantasy"),
    asset: RESPONSIVE_PROJECT_COVERS["/image/dongpo-fantasy-cover.png"],
  },
  {
    match: (image) =>
      image.includes("/projects/yongzhi-journey-game/cover/") || image.includes("mask-group2"),
    asset: RESPONSIVE_PROJECT_COVERS["/image/Mask group2.png"],
  },
  {
    match: (image) =>
      image.includes("/projects/lunanest-robotics/cover/") || image.includes("coverimg"),
    asset: RESPONSIVE_PROJECT_COVERS["/image/coverimg.png"],
  },
  {
    match: (image) =>
      image.includes("/projects/northeast-revitalization-interactive-news/cover/")
      || image.includes("rectangle"),
    asset: RESPONSIVE_PROJECT_COVERS["/image/Rectangle.png"],
  },
];

export function getResponsiveProjectCover(image?: string): ResponsiveProjectCover {
  if (!image) {
    return { src: "" };
  }

  const exactAsset = RESPONSIVE_PROJECT_COVERS[image];
  if (exactAsset) {
    return exactAsset;
  }

  const matchedAsset = RESPONSIVE_PROJECT_COVER_MATCHERS.find(({ match }) => match(image))?.asset;
  return matchedAsset ?? { src: image };
}
