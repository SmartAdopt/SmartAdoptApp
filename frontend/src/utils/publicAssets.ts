const withBaseUrl = (assetPath: string): string => {
  const normalizedAssetPath = assetPath.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedAssetPath}`;
};

export const PUBLIC_ASSETS = {
  adopt: withBaseUrl("adopt.svg"),
  cat: withBaseUrl("cat.svg"),
  dog: withBaseUrl("dog.svg"),
  google: withBaseUrl("google.svg"),
  heart: withBaseUrl("heart.svg"),
  home: withBaseUrl("home.svg"),
  logo: withBaseUrl("logo.svg"),
} as const;
