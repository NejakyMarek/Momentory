export type Frame = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  aspect?: number;
  bleed?: number;
};

export type Template = {
  key: string;
  name: string;
  frames: Frame[];
  minImages: number;
  maxImages: number;
  spread?: boolean;
};

export const TEMPLATES: Template[] = [
  {
    key: 'full-bleed',
    name: 'Full Bleed',
    frames: [
      {
        id: 'frame-1',
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        bleed: 0.05,
      },
    ],
    minImages: 1,
    maxImages: 1,
    spread: false,
  },
  {
    key: 'two-up',
    name: 'Two Up',
    frames: [
      {
        id: 'frame-1',
        x: 0,
        y: 0,
        w: 0.5,
        h: 1,
        aspect: 1,
      },
      {
        id: 'frame-2',
        x: 0.5,
        y: 0,
        w: 0.5,
        h: 1,
        aspect: 1,
      },
    ],
    minImages: 2,
    maxImages: 2,
    spread: false,
  },
  {
    key: 'three-grid',
    name: 'Three Grid',
    frames: [
      {
        id: 'frame-1',
        x: 0,
        y: 0,
        w: 0.5,
        h: 0.5,
        aspect: 1,
      },
      {
        id: 'frame-2',
        x: 0.5,
        y: 0,
        w: 0.5,
        h: 0.5,
        aspect: 1,
      },
      {
        id: 'frame-3',
        x: 0.25,
        y: 0.5,
        w: 0.5,
        h: 0.5,
        aspect: 1,
      },
    ],
    minImages: 3,
    maxImages: 3,
    spread: false,
  },
  {
    key: 'four-grid',
    name: 'Four Grid',
    frames: [
      {
        id: 'frame-1',
        x: 0,
        y: 0,
        w: 0.5,
        h: 0.5,
        aspect: 1,
      },
      {
        id: 'frame-2',
        x: 0.5,
        y: 0,
        w: 0.5,
        h: 0.5,
        aspect: 1,
      },
      {
        id: 'frame-3',
        x: 0,
        y: 0.5,
        w: 0.5,
        h: 0.5,
        aspect: 1,
      },
      {
        id: 'frame-4',
        x: 0.5,
        y: 0.5,
        w: 0.5,
        h: 0.5,
        aspect: 1,
      },
    ],
    minImages: 4,
    maxImages: 4,
    spread: false,
  },
  {
    key: 'collage',
    name: 'Collage',
    frames: [
      {
        id: 'frame-1',
        x: 0,
        y: 0,
        w: 0.6,
        h: 0.6,
        aspect: 1,
      },
      {
        id: 'frame-2',
        x: 0.6,
        y: 0,
        w: 0.4,
        h: 0.3,
        aspect: 1.5,
      },
      {
        id: 'frame-3',
        x: 0.6,
        y: 0.3,
        w: 0.4,
        h: 0.3,
        aspect: 1.5,
      },
      {
        id: 'frame-4',
        x: 0,
        y: 0.6,
        w: 0.3,
        h: 0.4,
        aspect: 0.75,
      },
      {
        id: 'frame-5',
        x: 0.3,
        y: 0.6,
        w: 0.3,
        h: 0.4,
        aspect: 0.75,
      },
      {
        id: 'frame-6',
        x: 0.6,
        y: 0.6,
        w: 0.4,
        h: 0.4,
        aspect: 1,
      },
    ],
    minImages: 3,
    maxImages: 6,
    spread: false,
  },
  {
    key: 'spread-full',
    name: 'Spread Full',
    frames: [
      {
        id: 'frame-1',
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        bleed: 0.05,
      },
    ],
    minImages: 1,
    maxImages: 1,
    spread: true,
  },
];

export function getTemplate(key: string): Template | undefined {
  return TEMPLATES.find(template => template.key === key);
}

export function getDefaultTemplate(): Template {
  return TEMPLATES[0]; // full-bleed
}
