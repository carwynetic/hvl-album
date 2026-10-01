import type { MetadataRoute } from "next";
import { assetPath } from "../utils/path";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HVL",
    short_name: "HVL",
    description: "HVL music experience",
    start_url: assetPath("/"),
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      {
        src: assetPath("/images/hvl-icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: assetPath("/images/hvl-icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
