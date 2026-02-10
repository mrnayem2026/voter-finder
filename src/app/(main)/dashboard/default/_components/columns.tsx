import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { voterApi } from "@/lib/api";

import { DataTableColumnHeader } from "../../../../../components/data-table/data-table-column-header";
import type { voterSchema } from "./schema";

export const voterColumns: ColumnDef<z.infer<typeof voterSchema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "voterSlipNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Slip Number" />,
    cell: ({ row }) => <div className="w-24 font-medium">{row.original.voterSlipNumber}</div>,
  },
  {
    accessorKey: "voterName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Voter Name" />,
    cell: ({ row }) => <div className="w-48">{row.original.voterName}</div>,
  },
  {
    accessorKey: "voterNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Voter Number" />,
    cell: ({ row }) => <div className="w-32">{row.original.voterNumber}</div>,
  },
  {
    accessorKey: "fatherName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Father's Name" />,
    cell: ({ row }) => <div className="w-40 text-muted-foreground">{row.original.fatherName}</div>,
  },
  {
    accessorKey: "motherName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mother's Name" />,
    cell: ({ row }) => <div className="w-40 text-muted-foreground">{row.original.motherName}</div>,
  },
  {
    accessorKey: "occupation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Occupation" />,
    cell: ({ row }) => <div className="w-32">{row.original.occupation || "N/A"}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => {
              // TODO: Implement Edit Dialog
              toast.info("Edit functionality coming soon");
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              if (confirm("Are you sure you want to delete this voter?")) {
                try {
                  await voterApi.delete(row.original.id);
                  toast.success("Voter deleted successfully");
                  // Trigger table refresh - usually handled via state or query key
                  window.location.reload();
                } catch (error: any) {
                  toast.error(error.message || "Delete failed");
                }
              }
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
];
