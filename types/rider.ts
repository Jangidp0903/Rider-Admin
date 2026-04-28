export type DateFilterType = "all" | "today" | "yesterday" | "last7" | "custom";
export type SortOrderType = "latest" | "oldest";
export type StatusFilterType = "all" | "checked-in" | "checked-out";

export interface FilterState {
  searchValue: string;
  statusFilter: StatusFilterType;
  dateFilter: DateFilterType;
  customDateRange: { from: string; to: string };
  sortOrder: SortOrderType;
}

export interface Rider {
  _id: string;
  feId: string;
  fullName: string;
  phone: string;
  token: number;
  status: "checked-in" | "checked-out";
  createdAt: string;
}
