import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Star, Download, Sparkles, Tag, Plus, ShoppingCart, Check, Filter } from "lucide-react";
import { toast } from "sonner";
interface MarketplaceProps {
  resumes: any[];
  onCloneResume: (parsedContent: any) => void;
}

export default function Marketplace({ resumes, onCloneResume }: MarketplaceProps) {
  const [publishOpen, setPublishOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Form states for publishing
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("0");
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const listItemsQuery = trpc.marketplace.list.useQuery({ type: "resume" });
  const publishMutation = trpc.marketplace.publish.useMutation();
  const downloadMutation = trpc.marketplace.download.useMutation();
  const rateMutation = trpc.marketplace.rate.useMutation();

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    try {
      const found = resumes.find(r => r.id === selectedResumeId);
      if (!found) {
        toast.error("Please select a resume draft to publish");
        return;
      }
      const contentString = found.content;

      await publishMutation.mutateAsync({
        title: newTitle,
        description: newDesc,
        type: "resume",
        content: contentString,
        price: Math.round(parseFloat(newPrice || "0") * 100),
        isPremium: parseFloat(newPrice || "0") > 0,
      });

      toast.success("Successfully published to Marketplace!");
      listItemsQuery.refetch();
      setPublishOpen(false);
      // Reset form
      setNewTitle("");
      setNewDesc("");
      setNewPrice("0");
      setSelectedResumeId("");
    } catch (err: any) {
      toast.error("Failed to publish item: " + err.message);
    }
  };

  const handleBuy = async () => {
    if (!selectedItem) return;
    try {
      await downloadMutation.mutateAsync({ id: selectedItem.id });
      toast.success(`Successfully purchased/cloned "${selectedItem.title}"!`);
      
      // Clone to user workspace if resume
      if (selectedItem.type === "resume") {
        try {
          const parsed = JSON.parse(selectedItem.content);
          onCloneResume(parsed);
        } catch {
          toast.error("Failed to inject workspace copy");
        }
      }
      
      setPurchaseOpen(false);
      listItemsQuery.refetch();
    } catch (e: any) {
      toast.error("Failed to process transaction");
    }
  };

  const handleRate = async (itemId: string, rating: number) => {
    try {
      await rateMutation.mutateAsync({ id: itemId, rating });
      toast.success("Rating submitted, thank you!");
      listItemsQuery.refetch();
    } catch (e) {
      toast.error("Could not record rating");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Verified Resume Marketplace
          </h2>
          <p className="text-slate-600 mt-1">
            Browse and clone professional resume blueprints or purchase verified high-converting CV presets.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium shadow-md transition-all gap-2">
                <Plus className="w-4 h-4" />
                Publish Resume
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <form onSubmit={handlePublish}>
                <DialogHeader>
                  <DialogTitle>Publish Resume Blueprint</DialogTitle>
                  <DialogDescription>
                    Share your resume structure and contents with the community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Listing Title</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Lead Product Designer Resume Preset"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Description</label>
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Brief details about job target, achievements, and why it works."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-semibold text-slate-700">Price (USD)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="0.00 (Free)"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Select Source Resume</label>
                    <Select
                      value={selectedResumeId}
                      onValueChange={setSelectedResumeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select one of your drafts..." />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPublishOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white">Publish Listing</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-600">Community CV Presets</span>
        </div>

        {/* Listings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listItemsQuery.data?.map((item) => (
            <Card key={item.id} className="flex flex-col border border-slate-200 shadow-sm hover:shadow-md transition">
              <CardHeader className="pb-3 bg-slate-50/50 rounded-t-xl">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={item.type === "template" ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-blue-50 text-blue-800 border-blue-200"}>
                    {item.type === "template" ? "Style Theme" : "Verified Resume"}
                  </Badge>
                  <span className="text-sm font-extrabold text-slate-900">
                    {item.price === 0 ? "Free" : `$${(item.price / 100).toFixed(2)}`}
                  </span>
                </div>
                <CardTitle className="text-lg text-slate-800">{item.title}</CardTitle>
                <CardDescription className="text-xs">Published by {item.authorName}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    {item.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {item.downloads} downloads
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4 flex gap-2">
                <div className="flex gap-1 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(item.id, star)}
                      className="hover:scale-110 transition duration-150"
                    >
                      <Star className="w-3.5 h-3.5 text-slate-300 hover:text-amber-500" />
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setSelectedItem(item);
                    setPurchaseOpen(true);
                  }}
                  size="sm"
                  className="ml-auto bg-slate-900 text-white hover:bg-slate-800 gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Get
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Deploying template blueprint or public resume instance directly into your active dashboard workspace.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-3">
              <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50">
                <div className="text-xs text-slate-500">Item Selected</div>
                <div className="font-bold text-slate-800">{selectedItem.title}</div>
                <div className="text-xs text-slate-600 mt-1">{selectedItem.description}</div>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Total Due:</span>
                <span className="text-lg font-bold text-blue-600">
                  {selectedItem.price === 0 ? "Free" : `$${(selectedItem.price / 100).toFixed(2)}`}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setPurchaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuy} className="bg-blue-600 text-white gap-2">
              <Check className="w-4 h-4" />
              Confirm Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
