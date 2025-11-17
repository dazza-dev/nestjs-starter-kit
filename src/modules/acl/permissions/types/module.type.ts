export interface Module {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
}

export interface ModuleWithDates extends Module {
  createdAt: Date;
  updatedAt: Date;
}
