/** Website-ready footage. Source ranges and credits live in the asset manifests. */
interface Film {
  base: string;
  portraitPoster?: string;
  position?: string;
}

export const films = {
  paddy: { base: '/media/paddy' },
  planting: { base: '/media/planting' },
  harvest: { base: '/media/harvest' },
  aerial: { base: '/media/cinematic/aerial', portraitPoster: '/media/cinematic/aerial-portrait.webp' },
  fieldPlanting: { base: '/media/cinematic/planting' },
  growing: { base: '/media/cinematic/growing' },
  ripening: { base: '/media/cinematic/ripening' },
  fieldHarvest: { base: '/media/cinematic/harvest', position: '35% 50%' },
} satisfies Record<string, Film>;

export type FilmName = keyof typeof films;
export const filmFor = (name: FilmName): Film => films[name];

// Flowering, drying, milling, and packing retain labelled illustrations:
// the supplied films do not document those specific operations.
export const chapterFilm = (index: number): FilmName | undefined => ({
  1: 'fieldPlanting', 2: 'growing', 4: 'ripening', 5: 'fieldHarvest',
} as Partial<Record<number, FilmName>>)[index];
