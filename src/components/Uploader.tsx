"use client";

import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

type Props = {
  onChange(urls: string[]): void; // zoznam CDN URL
};

export default function Uploader({ onChange }: Props) {
  return (
    <div style={{ marginTop: 16 }}>
      <FileUploaderRegular
        pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY!}
        multiple
        accept="image/*"
        onChange={(files: any) => {
          const list = (files?.files || [])
            .map((f: any) => f?.cdnUrl)
            .filter(Boolean) as string[];
          onChange(list);
        }}
      />
    </div>
  );
}