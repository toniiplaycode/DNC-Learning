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
  code: string;
  name: string;
  description?: string;
  facultyId: number;
}

export interface UpdateMajorDto {
  code?: string;
  name?: string;
  description?: string;
  facultyId?: number;
}
