"use client";

import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

type Props = { onChange(urls: string[]): void };

// Pomocné typy (len to, čo potrebujeme)
type AnyObj = Record<string, any>;
type UcEntry = { cdnUrl?: string | null; status?: string };

/** Z eventu vytiahni CDN URL-ka, nech príde čokoľvek */
function extractUrls(payload: unknown): string[] {
  const p = payload as AnyObj | undefined;

  // 1) Web-component štýl: e.detail.allEntries
  const fromDetail = p?.detail?.allEntries as UcEntry[] | undefined;
  if (Array.isArray(fromDetail)) {
    return fromDetail
      .filter(x => x?.status === "success" && !!x?.cdnUrl)
      .map(x => x.cdnUrl!) ;
  }

  // 2) Niektoré verzie dávajú priamo allEntries / files
  const entries = (p?.allEntries ?? p?.files) as UcEntry[] | undefined;
  if (Array.isArray(entries)) {
    return entries
      .filter(x => !!x?.cdnUrl)
      .map(x => x.cdnUrl!) ;
  }

  // 3) Už uplodované položky môžu byť aj v poli
  if (Array.isArray(p)) {
    return (p as UcEntry[])
      .filter(x => !!x?.cdnUrl)
      .map(x => x.cdnUrl!) ;
  }

  return [];
}

export default function Uploader({ onChange }: Props) {
  const pubkey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "demopublickey";

  const handleChange = (ev: unknown) => {
    const urls = extractUrls(ev);
    onChange(urls);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <FileUploaderRegular
        pubkey={pubkey}
        multiple
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}