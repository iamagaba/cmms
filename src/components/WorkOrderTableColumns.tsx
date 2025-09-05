import React from 'react';
import { Avatar, Chip, IconButton, Menu, MenuItem, Typography, Box, Tooltip, Select } from "@mui/material";
import { MoreVert, Delete, Edit, AccessTime, Warning } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import { WorkOrder, Technician, Location, technicians as allTechnicians } from "@/data/mockData";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);

export type WorkOrderRow = WorkOrder & {
  technician?: Technician;
  location?: Location;
};

const priorityColors: Record<WorkOrder['priority'], "error" | "warning" | "success"> = {
  High: "error",
  Medium: "warning",
  Low: "success",
};

const statusColors: Record<WorkOrder['status'], "info" | "warning" | "secondary" | "success"> = {
    Open: "info",
    "In Progress": "warning",
    "On Hold": "secondary",
    Completed: "success",
};

const SlaDisplay = ({ slaDue }: { slaDue: string }) => {
  const dueDate = dayjs(slaDue);
  const now = dayjs();
  const isOverdue = dueDate.isBefore(now);
  const isDueSoon = dueDate.isBefore(now.add(1, 'day'));

  let icon = <AccessTime sx={{ color: 'success.main' }} />;
  if (isOverdue) {
    icon = <Warning sx={{ color: 'error.main' }} />;
  } else if (isDueSoon) {
    icon = <AccessTime sx={{ color: 'warning.main' }} />;
  }

  return (
    <Tooltip title={`Due: ${dueDate.format("MMM D, YYYY h:mm A")}`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="body2" color={isOverdue ? 'error' : 'text.secondary'}>{dueDate.fromNow()}</Typography>
      </Box>
    </Tooltip>
  );
};

const ActionsCell = ({ row, onEdit, onDelete }: { row: WorkOrderRow, onEdit: (r: WorkOrderRow) => void, onDelete: (r: WorkOrderRow) => void }) => {
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
        <MenuItem onClick={handleEdit}><Edit sx={{ mr: 1 }} /> Edit Work Order</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><Delete sx={{ mr: 1 }} /> Delete Work Order</MenuItem>
      </Menu>
    </>
  );
};

export const getColumns = (
  onEdit: (record: WorkOrderRow) => void,
  onDelete: (record: WorkOrderRow) => void,
  onUpdateWorkOrder: (id: string, field: keyof WorkOrder, value: any) => void
): GridColDef[] => [
  {
    field: "id",
    headerName: "ID",
    width: 100,
    renderCell: (params) => <Link to={`/work-orders/${params.value}`}><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{params.value}</Typography></Link>
  },
  {
    field: "customerName",
    headerName: "Customer & Vehicle",
    flex: 1,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
        <Typography variant="caption" color="text.secondary">{params.row.vehicleId} ({params.row.vehicleModel})</Typography>
      </Box>
    )
  },
  {
    field: "service",
    headerName: "Service",
    flex: 1,
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => (
      <Select
        value={params.value}
        onChange={(e) => onUpdateWorkOrder(params.row.id, 'status', e.target.value)}
        variant="standard"
        fullWidth
        disableUnderline
      >
        {Object.keys(statusColors).map(status => (
          <MenuItem key={status} value={status}>
            <Chip label={status} color={statusColors[status as keyof typeof statusColors]} size="small" />
          </MenuItem>
        ))}
      </Select>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 120,
    renderCell: (params) => (
      <Select
        value={params.value}
        onChange={(e) => onUpdateWorkOrder(params.row.id, 'priority', e.target.value)}
        variant="standard"
        fullWidth
        disableUnderline
      >
        {Object.keys(priorityColors).map(p => (
          <MenuItem key={p} value={p}>
            <Chip label={p} color={priorityColors[p as keyof typeof priorityColors]} size="small" />
          </MenuItem>
        ))}
      </Select>
    ),
  },
  {
    field: "assignedTechnicianId",
    headerName: "Technician",
    width: 200,
    renderCell: (params) => (
      <Select
        value={params.value || ''}
        onChange={(e) => onUpdateWorkOrder(params.row.id, 'assignedTechnicianId', e.target.value === '' ? null : e.target.value)}
        variant="standard"
        fullWidth
        disableUnderline
        displayEmpty
      >
        <MenuItem value=""><em>Unassigned</em></MenuItem>
        {allTechnicians.map(tech => (
          <MenuItem key={tech.id} value={tech.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24 }} src={tech.avatar}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
              {tech.name}
            </Box>
          </MenuItem>
        ))}
      </Select>
    )
  },
  {
    field: "slaDue",
    headerName: "SLA Due",
    width: 150,
    renderCell: (params) => <SlaDisplay slaDue={params.value} />,
    sortComparator: (v1, v2) => dayjs(v1).unix() - dayjs(v2).unix(),
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