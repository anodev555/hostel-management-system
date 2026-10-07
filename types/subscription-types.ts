export type PlanStatusFilter = "all" | "active" | "inactive";

export type ListPlansInput = {
  search?: string;
  page?: number;
  perPage?: number;
  status?: PlanStatusFilter;
};

export type PlanListItem = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  maxStudents: number | null;
  maxStaff: number | null;
  isActive: boolean;
  subscriberCount: number;
  createdAt: Date;
};

export type PlanListPayload = {
  plans: PlanListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};
