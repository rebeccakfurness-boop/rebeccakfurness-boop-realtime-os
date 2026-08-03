export interface FivePanelCategories {
  leadership: string;
  community: string;
  cultural: string;
  academic: string;
  sportMusicArts: string;
}

export const EMPTY_CATEGORIES: FivePanelCategories = {
  leadership: "",
  community: "",
  cultural: "",
  academic: "",
  sportMusicArts: "",
};

export const CATEGORY_LABELS: { key: keyof FivePanelCategories; label: string; hint: string }[] = [
  { key: "leadership", label: "Leadership", hint: "Roles where you led, organised or took initiative." },
  { key: "community", label: "Community", hint: "Volunteering, service, or contributions beyond yourself." },
  { key: "cultural", label: "Cultural", hint: "Cultural groups, performance, language, heritage involvement." },
  { key: "academic", label: "Academic", hint: "Subjects, results, awards, research or academic projects." },
  { key: "sportMusicArts", label: "Sport, music & arts", hint: "Teams, performances, competitions, creative practice." },
];

export interface CvContent {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  categories: FivePanelCategories;
}

export const EMPTY_CV: CvContent = {
  fullName: "",
  email: "",
  phone: "",
  summary: "",
  categories: { ...EMPTY_CATEGORIES },
};

export interface ApplicationContent {
  scholarshipTitle: string;
  valuesFit: string;
  leadership: string;
  community: string;
  academic: string;
  honestMoment: string;
  closing: string;
}

export const EMPTY_APPLICATION: ApplicationContent = {
  scholarshipTitle: "",
  valuesFit: "",
  leadership: "",
  community: "",
  academic: "",
  honestMoment: "",
  closing: "",
};

export const APPLICATION_SECTIONS: { key: keyof ApplicationContent; label: string; hint: string; optional?: boolean }[] = [
  { key: "valuesFit", label: "Values and fit", hint: "Why this scholarship, and why it fits who you are." },
  { key: "leadership", label: "Leadership", hint: "Where you've led, and what it taught you." },
  { key: "community", label: "Community", hint: "How you've contributed beyond yourself." },
  { key: "academic", label: "Academic", hint: "Your academic record and what drives it." },
  { key: "honestMoment", label: "An honest moment", hint: "A real setback or doubt, and what you did with it.", optional: true },
  { key: "closing", label: "Closing: merit and future impact", hint: "What you'll do with this opportunity." },
];

export interface CoverLetterContent {
  roleTitle: string;
  companyName: string;
  tone: "professional" | "early_career";
  categories: FivePanelCategories;
  closing: string;
}

export const EMPTY_COVER_LETTER: CoverLetterContent = {
  roleTitle: "",
  companyName: "",
  tone: "professional",
  categories: { ...EMPTY_CATEGORIES },
  closing: "",
};
