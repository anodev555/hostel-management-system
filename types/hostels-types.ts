export type HostelStatusFilter = "all" | "active" | "inactive";

export type ListHostelsInput = {
  search?: string;
  page?: number;
  perPage?: number;
  status?: HostelStatusFilter;
};

export type HostelListItem = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: Date;
  totalStudents: number;
  staffCount: number;
  ownerId: string | null;
  ownerName: string | null;
  ownerUsername: string | null;
};

export type HostelListMetrics = {
  total: number;
  active: number;
  inactive: number;
  totalStudents: number;
};

export type HostelListPayload = {
  hostels: HostelListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  metrics: HostelListMetrics;
};
