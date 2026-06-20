import { useState, useEffect } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import ATSScanner from "@/components/ATSScanner";
import Marketplace from "@/components/Marketplace";
import OrganizationPortal from "@/components/OrganizationPortal";
import RecruiterPortal from "@/components/RecruiterPortal";
import JobBoard from "@/components/JobBoard";
import AffiliateSystem from "@/components/AffiliateSystem";
import BillingPortal from "@/components/BillingPortal";
import AdminCRM from "@/components/AdminCRM";
import { FileText, Plus, Zap, Award, Sparkles, Building, Store, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const listResumesQuery = trpc.resume.list.useQuery(undefined, {
    enabled: !!user,
  });

  const deleteResumeMutation = trpc.resume.delete.useMutation();

  const handleDeleteResume = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await deleteResumeMutation.mutateAsync({ id });
      toast.success("Resume deleted");
      listResumesQuery.refetch();
    } catch (e) {
      toast.error("Failed to delete resume");
    }
  };

  const handleCloneResume = (parsedContent: any) => {
    toast.success("Resume cloned! Opening builder...");
    // Open builder with cloned content
    setLocation("/builder");
  };

  const resumes = listResumesQuery.data || [];
  const activeResume = resumes.find(r => r.id === selectedResumeId) || resumes[0] || null;

  return (
    <DashboardLayout>
      <Switch>
        {/* Default dashboard tab: Resume Listing */}
        <Route path="/dashboard">
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Resume Documents
                </h2>
                <p className="text-slate-600 mt-1">
                  Create, upload, customize, and align your CV drafts to match target criteria.
                </p>
              </div>
              <Link href="/builder">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md transition-all gap-2">
                  <Plus className="w-4 h-4" />
                  New Resume
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="flex flex-col border border-slate-200 shadow-sm hover:shadow-md transition">
                  <CardHeader className="pb-3 bg-slate-50/50 rounded-t-xl">
                    <CardTitle className="text-lg text-slate-800 truncate">{resume.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Last updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow flex items-center justify-center min-h-[120px]">
                    <div className="text-center space-y-2">
                      <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] uppercase tracking-wider font-bold">
                        Exclusive ATS Layout
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 pt-4 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setLocation(`/builder?edit=${resume.id}`)}
                      size="sm"
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs flex-1"
                    >
                      Open Editor
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteResume(resume.id)}
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs shrink-0"
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {resumes.length === 0 && (
                <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-500 italic">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  No resumes built yet. Click 'New Resume' or import an existing CV to begin.
                </div>
              )}
            </div>
          </div>
        </Route>

        {/* ATS Resume compliance scanner */}
        <Route path="/dashboard/ats">
          <ATSScanner
            resumes={resumes}
            activeResumeId={selectedResumeId}
            onSelectResume={(id) => setSelectedResumeId(id)}
          />
        </Route>

        {/* Template marketplace */}
        <Route path="/dashboard/marketplace">
          <Marketplace
            resumes={resumes}
            onCloneResume={handleCloneResume}
          />
        </Route>

        {/* Job Listings Board */}
        <Route path="/dashboard/jobs">
          <JobBoard activeResume={activeResume} />
        </Route>

        {/* Recruiter hiring pipelines */}
        <Route path="/dashboard/recruiter">
          <RecruiterPortal />
        </Route>

        {/* Affiliate Program tracker */}
        <Route path="/dashboard/affiliate">
          <AffiliateSystem userId={user?.id || 1} />
        </Route>

        {/* Teams and Tenant configurations */}
        <Route path="/dashboard/organization">
          <OrganizationPortal />
        </Route>

        {/* Subscriptions upgrade grid */}
        <Route path="/dashboard/billing">
          <BillingPortal resumesCount={resumes.length} />
        </Route>

        {/* Master CRM admin views */}
        <Route path="/dashboard/admin">
          {user?.role === "admin" ? (
            <AdminCRM />
          ) : (
            <div className="p-8 text-center text-rose-600 font-bold bg-rose-50 border border-rose-200 rounded-xl">
              Access Denied: Admin role credentials required.
            </div>
          )}
        </Route>
      </Switch>
    </DashboardLayout>
  );
}
