"use client"

import React from "react"
import FoodingHeader from "./form-header"
import { FoodPlan } from "@/types/food-types"
import { SearchBar } from "@/components/search-bar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "lucide-react"
import Link from "next/link"

export default function FoodingList({ fooding }: { fooding: FoodPlan[] }) {
  return (
    <div className="flex flex-col gap-4">
      <FoodingHeader />

      <div className="flex flex-col gap-2">
        <SearchBar
          param="search"
          placeholder="Search fooding plan"
          className="w-full max-w-md"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Monthly Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fooding.length > 0 ? (
              fooding.map((food) => (
                <TableRow key={food.id}>
                  <TableCell>{food.name}</TableCell>
                  <TableCell>{food.monthlyPrice}</TableCell>
                  <TableCell>
                    {food.status === "active" ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500 text-white"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-500 text-white"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/org/dashboard/setting/fooding/${food.id}`}>
                      <Button variant="default" size="icon">
                        <PencilIcon className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
