"use client";

import { usePoints } from "@/hooks/use-points";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

export function PointsOverview() {
  const { points, totalPoints, loading } = usePoints();

  if (loading) {
    return <div>Loading points...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Points History</h2>
        <span className="text-2xl font-bold">{totalPoints} points</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reason</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="text-right">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {points.map((point) => (
            <TableRow key={point.id}>
              <TableCell>{point.reason}</TableCell>
              <TableCell className="text-right">+{point.amount}</TableCell>
              <TableCell className="text-right">
                {formatDistanceToNow(new Date(point.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}