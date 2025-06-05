export enum MajorStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Major {
  id: number;
  code: string;
  name: string;
  description?: string;
  facultyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMajorDto {
  facultyId: number;
  majorCode: string;
  majorName: string;
  description?: string;
  status?: MajorStatus;
}

export interface UpdateMajorDto {
  majorCode?: string;
  majorName?: string;
  description?: string;
  status?: MajorStatus;
}
