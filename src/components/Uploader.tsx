"use client";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

type Props = { onChange(urls: string[]): void };

// Uploadcare dáva dáta v e.detail.allEntries
type UcEntry = { cdnUrl?: string; status?: string };
type UcChangeEvent = { detail?: { allEntries?: UcEntry[] } };

export default function Uploader({ onChange }: Props) {
  const pubkey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "demopublickey";

  const handleChange = (e: unknown) => {
    const ev = e as UcChangeEvent;
    const urls =
      ev?.detail?.allEntries
        ?.filter((it) => it.status === "success" && !!it.cdnUrl)
        .map((it) => it.cdnUrl!) ?? [];
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