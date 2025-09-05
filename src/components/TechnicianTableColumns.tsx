import React from 'react';
import { Avatar, Chip, IconButton, Menu, MenuItem, Typography, Box } from "@mui/material";
import { MoreVert, Delete, Edit } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Technician } from "@/data/mockData";

export type TechnicianRow = Technician & {
  openTasks: number;
};

const statusColorMap: Record<TechnicianRow['status'], "success" | "warning" | "default"> = {
  available: 'success',
  busy: 'warning',
  offline: 'default',
};

const statusTextMap: Record<TechnicianRow['status'], string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

const ActionsCell = ({ row, onEdit, onDelete }: { row: TechnicianRow, onEdit: (r: TechnicianRow) => void, onDelete: (r: TechnicianRow) => void }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleEdit = () => {
    onEdit(row);
    handleClose();
  };

  const handleDelete = () => {
    onDelete(row);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleEdit}><Edit sx={{ mr: 1 }} /> Edit Details</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><Delete sx={{ mr: 1 }} /> Delete Technician</MenuItem>
      </Menu>
    </>
  );
};

export const getTechnicianColumns = (
  onEdit: (record: TechnicianRow) => void,
  onDelete: (record: TechnicianRow) => void
): GridColDef[] => [
  {
    field: "name",
    headerName: "Technician",
    flex: 1,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={params.row.avatar}>{params.value.split(' ').map((n: string) => n[0]).join('')}</Avatar>
        <Link to={`/technicians/${params.row.id}`}>
            <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
        </Link>
      </Box>
    )
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => (
      <Chip label={statusTextMap[params.value]} color={statusColorMap[params.value]} size="small" />
    )
  },
  {
    field: "openTasks",
    headerName: "Open Tasks",
    width: 150,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    align: "right",
    headerAlign: "right",
    sortable: false,
    renderCell: (params) => <ActionsCell row={params.row} onEdit={onEdit} onDelete={onDelete} />,
  },
];