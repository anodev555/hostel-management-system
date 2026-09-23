export type FoodPlan = {
  id: string
  name: string
  monthlyPrice: string
  createdBy: string | null
  createdByName?: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  updatedBy: string | null
}

export type ActiveFoodPlanOption = Pick<FoodPlan, "id" | "name" | "monthlyPrice">
