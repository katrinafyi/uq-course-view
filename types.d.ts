export type CourseDetails = {
  code: string,
  name: string,
  'assessment-methods': string,
  contact: string,
  coordinator: string,
  description: string,
  duration: string,
  faculty: string,
  incompatible: string,
  prerequisite: string,
  studyabroad: string,
  units: string,
  updated: Date,
  level: string,
  offerings: Offering[],
}

export type Offering = {
  code: string,
  year: string,
  archived: boolean,
  name: string,
  location: string,
  mode: string,
  profile: string,
}