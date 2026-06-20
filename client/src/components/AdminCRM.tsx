import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { ShieldCheck, Users, LifeBuoy, TrendingUp, DollarSign, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

// Simulated registration and revenue historical chart metrics
const chartData = [
  { date: "Jun 14", users: 120, revenue: 450 },
  { date: "Jun 15", users: 135, revenue: 580 },
  { date: "Jun 16", users: 154, revenue: 790 },
  { date: "Jun 17", users: 172, revenue: 980 },
  { date: "Jun 18", users: 198, revenue: 1210 },
  { date: "Jun 19", users: 215, revenue: 1480 },
  { date: "Jun 20", users: 242, revenue: 1820 },
];

export default function AdminCRM() {
  const statsQuery = trpc.admin.getDashboardStats.useQuery();
  const usersQuery = trpc.admin.getUsers.useQuery();
  const ticketsQuery = trpc.admin.getTickets.useQuery();

  const resolveTicketMutation = trpc.admin.resolveTicket.useMutation();

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await resolveTicketMutation.mutateAsync({
        id: ticketId,
        status: "resolved",
      });
      toast.success("Support ticket marked as resolved!");
      ticketsQuery.refetch();
    } catch (e) {
      toast.error("Could not resolve support ticket");
    }
  };

  const stats = statsQuery.data || {
    totalUsers: 0,
    activeUsers: 0,
    resumesCreated: 0,
    pdfDownloads: 0,
    subscriptionRevenue: 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-indigo-600 shrink-0" />
          HexaCv Master Admin CRM
        </h2>
        <p className="text-slate-600 mt-1">
          Monitor system metrics, review corporate user details, manage active payout audits, and resolve support logs.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Total Users Registered
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">{stats.totalUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Active Users (30 Days)
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">{stats.activeUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Resumes Created
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">{stats.resumesCreated}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-indigo-50/50 border-indigo-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-indigo-800 tracking-wider">
              Monthly SaaS Revenue
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-indigo-950 flex items-center">
              <DollarSign className="w-6 h-6 text-indigo-600" />
              {stats.subscriptionRevenue}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Visual Analytics Recharts Chart */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Growth Performance Chart
          </CardTitle>
          <CardDescription>Visual stats for registrations and ARR progress (weekly delta)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" name="Active Users" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Records and Support tickets */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* User Database */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-slate-500" />
              HexaCv User Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Resumes</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-800 text-xs">{user.name}</div>
                      <div className="text-slate-500 text-[10px]">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        user.tier === "enterprise" ? "bg-indigo-50 border-indigo-200 text-indigo-800" :
                        user.tier === "pro" ? "bg-blue-50 border-blue-200 text-blue-800" :
                        "bg-slate-100 text-slate-700"
                      }>
                        {user.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.resumesCount} drafts</TableCell>
                    <TableCell>
                      <span className="text-xs uppercase font-medium">{user.role}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Support Tickets resolution */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2">
              <LifeBuoy className="w-4.5 h-4.5 text-slate-500" />
              Pending Support Desk Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketsQuery.data?.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-800 text-xs">{ticket.title}</div>
                      <div className="text-slate-500 text-[10px]">{ticket.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        ticket.priority === "high" ? "bg-red-50 text-red-800 border-red-200" : "bg-slate-100 text-slate-700"
                      }>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        ticket.status === "open" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {ticket.status === "open" && (
                        <Button
                          onClick={() => handleResolveTicket(ticket.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[10px] h-7 px-2"
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {ticketsQuery.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500 italic">
                      Zero pending help tickets. Excellent customer satisfaction metrics!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
