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

export type HostelDetail = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: Date;
  totalStudents: number;
  staffCount: number;
  owner: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    phone: string | null;
    image: string | null;
    createdAt: Date;
    isActive: boolean;
  } | null;
  subscription: {
    id: string;
    planId: string;
    planName: string;
    priceAtSignup: string;
    status: string;
    maxStudentsSnapshot: number | null;
    maxStaffSnapshot: number | null;
    nextBillingDate: string;
    startedAt: Date;
  } | null;
  availablePlans: Array<{
    id: string;
    name: string;
    price: string | null;
    description: string | null;
    maxStudents: number | null;
    maxStaff: number | null;
  }>;
};
