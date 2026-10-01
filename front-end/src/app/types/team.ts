export const TEAM_LOCALES = ['en', 'fr', 'rw', 'sw'] as const;
export type TeamLocale = typeof TEAM_LOCALES[number];
export type LocalizedText = { en: string; fr?: string; rw?: string; sw?: string };
export const TEAM_SECTIONS = ['LEADERSHIP', 'FOUNDERS', 'DEPARTMENTS'] as const;
export type TeamSection = typeof TEAM_SECTIONS[number];
export type TeamTitleSource = 'PRIMARY' | 'SECONDARY' | 'CUSTOM' | 'NONE';
export type TeamRegion = 'Africa' | 'Europe' | 'Asia' | 'USA';
export const TEAM_PAGE_FIELDS = ['heroBadge', 'heroTitle', 'heroSubtitle', 'leadershipEyebrow', 'leadershipTitle', 'foundersEyebrow', 'foundersTitle', 'departmentsEyebrow', 'departmentsTitle', 'seoTitle', 'seoDescription'] as const;
export type TeamPageField = typeof TEAM_PAGE_FIELDS[number];
export type TeamPageCopy = Record<TeamPageField, LocalizedText>;
export interface TeamPlacementInput {
  id?: string;
  section: TeamSection;
  departmentId: string | null;
  countryOverride: string | null;
  region: TeamRegion | null;
  sortOrder: number;
  visible: boolean;
  titleSource: TeamTitleSource;
  secondaryTitleSource: TeamTitleSource;
  customTitle: LocalizedText;
  customSecondaryTitle: LocalizedText;
  bio: LocalizedText;
}
export interface TeamPersonInput {
  slug: string;
  fullName: string;
  country: string;
  primaryTitle: LocalizedText;
  secondaryTitle: LocalizedText;
  profilePath: string | null;
  published: boolean;
  version?: number;
  placements: TeamPlacementInput[];
  photo: { action: 'KEEP' | 'UPLOAD' | 'URL'; url?: string };
}
export interface AdminTeamPerson extends Omit<TeamPersonInput, 'photo' | 'version'> {
  id: string;
  version: number;
  photoUrl: string | null;
  photoSource: 'CLOUDINARY_UPLOAD' | 'EXTERNAL_URL' | null;
  placements: (TeamPlacementInput & { id: string })[];
}
export interface AdminTeamDepartment {
  id: string;
  key: string;
  name: LocalizedText;
  sortOrder: number;
  visible: boolean;
  version: number;
}
export interface AdminTeamPage { copy: TeamPageCopy; version: number; }
export interface AdminTeamSnapshot {
  people: AdminTeamPerson[];
  departments: AdminTeamDepartment[];
  page: AdminTeamPage;
  directoryVersion: number;
}
export interface PublicTeamPerson {
  id: string;
  slug: string;
  fullName: string;
  country: string;
  primaryTitle: string;
  secondaryTitle: string;
  photoUrl: string | null;
  profilePath: string | null;
}
export interface PublicTeamPlacement {
  id: string;
  personId: string;
  slug: string;
  fullName: string;
  photoUrl: string | null;
  profilePath: string | null;
  country: string;
  region: TeamRegion | null;
  departmentId: string | null;
  departmentName: string | null;
  title: string;
  secondaryTitle: string;
  bio: string;
  sortOrder: number;
}
export interface PublicTeamSnapshot {
  locale: TeamLocale;
  page: Record<TeamPageField, string>;
  departments: { id: string; key: string; name: string; sortOrder: number }[];
  sections: Record<TeamSection, PublicTeamPlacement[]>;
}
