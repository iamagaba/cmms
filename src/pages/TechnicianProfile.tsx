import { useParams, Link, useNavigate } from "react-router-dom";
import { technicians, workOrders, locations } from "@/data/mockData";
import { Table, Typography } from "antd";
import { ArrowLeft, Mail, Phone, Wrench, Calendar } from "lucide-react";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const { Text } = Typography;

const statusVariantMap: Record<string, string> = {
  available: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  busy: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  offline: "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200",
};

const statusTextMap: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

const priorityColors: Record<string, string> = {
    High: "red",
    Medium: "gold",
    Low: "green",
};

const TechnicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const technician = technicians.find(t => t.id === id);
  const assignedWorkOrders = workOrders.filter(wo => wo.assignedTechnicianId === id);

  if (!technician) {
    return <NotFound />;
  }

  const workOrderColumns = [
    { title: 'ID', dataIndex: 'id', render: (text: string) => <Link to={`/work-orders#${text}`}><Text code>{text}</Text></Link> },
    { title: 'Vehicle', dataIndex: 'vehicleId' },
    { title: 'Priority', dataIndex: 'priority', render: (priority: string) => <Badge className={cn(priority === 'High' && 'bg-red-100 text-red-800', priority === 'Medium' && 'bg-yellow-100 text-yellow-800', priority === 'Low' && 'bg-green-100 text-green-800')}>{priority}</Badge> },
    { title: 'Location', dataIndex: 'locationId', render: (locId: string) => locations.find(l => l.id === locId)?.name || 'N/A' },
    { title: 'Due Date', dataIndex: 'slaDue', render: (date: string) => dayjs(date).format('MMM D, YYYY') },
  ];

  const InfoItem = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-b-0">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {icon}
            <span>{label}</span>
        </div>
        <div className="text-sm font-medium text-right">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
        <div>
            <Button variant="outline" size="sm" onClick={() => navigate('/technicians')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Technicians
            </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={technician.avatar} alt={technician.name} />
                                <AvatarFallback>{technician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-semibold">{technician.name}</h2>
                                <Badge className={cn("mt-1", statusVariantMap[technician.status])}>
                                    {statusTextMap[technician.status]}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                    <div className="border-t">
                        <InfoItem icon={<Mail className="h-4 w-4" />} label="Email">
                            <a href={`mailto:${technician.email}`} className="text-primary hover:underline">{technician.email}</a>
                        </InfoItem>
                        <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone">
                            <a href={`tel:${technician.phone}`} className="text-primary hover:underline">{technician.phone}</a>
                        </InfoItem>
                        <InfoItem icon={<Wrench className="h-4 w-4" />} label="Specialization">
                            {technician.specialization}
                        </InfoItem>
                        <InfoItem icon={<Calendar className="h-4 w-4" />} label="Member Since">
                            {dayjs(technician.joinDate).format('MMMM YYYY')}
                        </InfoItem>
                    </div>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Work Orders ({assignedWorkOrders.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table 
                            dataSource={assignedWorkOrders} 
                            columns={workOrderColumns} 
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default TechnicianProfilePage;