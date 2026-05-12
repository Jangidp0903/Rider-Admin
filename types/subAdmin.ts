export interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  hubName: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface SubAdminPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
