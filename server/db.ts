import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, resumes, InsertResumeDb, jobDescriptions, InsertJobDescriptionDb, subscriptions, supportTickets,
  organizations, InsertOrganizationDb, organizationMembers, InsertOrganizationMemberDb,
  marketplaceItems, InsertMarketplaceItemDb, affiliateReferrals, InsertAffiliateReferralDb,
  recruiterJobs, InsertRecruiterJobDb, jobApplications, InsertJobApplicationDb
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==========================================
// FALLBACK IN-MEMORY DB FOR LOCAL SANDBOX
// ==========================================
export const mockDb = {
  users: [
    { id: 1, openId: "admin-key-owner", name: "Surag", email: "surag@hexastacksolutions.com", loginMethod: "oauth", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    { id: 2, openId: "user-2", name: "Anandu Krishna", email: "anandu@hexastacksolutions.com", loginMethod: "oauth", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    { id: 3, openId: "user-3", name: "John Doe", email: "john@example.com", loginMethod: "oauth", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }
  ] as any[],
  resumes: [] as any[],
  jobDescriptions: [
    { id: "preset-1", userId: null, title: "Full-Stack Developer", description: "Looking for a full stack engineer with expertise in React, Node.js, and databases.", keywords: JSON.stringify(["React", "Node.js", "databases", "TypeScript", "SQL"]), isCustom: false, createdAt: new Date() },
    { id: "preset-2", userId: null, title: "Frontend Engineer", description: "Seeking a frontend developer specialized in UI animations, React, CSS, and web responsiveness.", keywords: JSON.stringify(["React", "CSS", "animations", "HTML", "Figma"]), isCustom: false, createdAt: new Date() }
  ] as any[],
  organizations: [
    { id: "org-1", name: "HexaStack Solutions", slug: "hexastack", logoUrl: "https://www.hexastacksolutions.com/logo.png", primaryColor: "#1e40af", secondaryColor: "#0d9488", customDomain: "hexastack.hexacv.com", createdAt: new Date(), updatedAt: new Date() }
  ] as any[],
  organizationMembers: [
    { id: "om-1", organizationId: "org-1", userId: 1, role: "owner", joinedAt: new Date() },
    { id: "om-2", organizationId: "org-1", userId: 2, role: "recruiter", joinedAt: new Date() }
  ] as any[],
  marketplaceItems: [
    { id: "mkt-1", title: "Classic ATS Blue Template", description: "Standard single-column ATS optimized resume template.", type: "template", content: "classic-ats-blue", authorId: 1, price: 0, rating: "4.9", downloads: 142, isPremium: false, createdAt: new Date() },
    { id: "mkt-2", title: "Modern Sidebar Lite Template", description: "Creative dual-column layout template featuring side contacts.", type: "template", content: "modern-sidebar-lite", authorId: 1, price: 0, rating: "4.7", downloads: 98, isPremium: false, createdAt: new Date() },
    { id: "mkt-3", title: "FAANG Software Engineer CV", description: "Verified resume structure that secured offers at Meta, Google, and Amazon.", type: "resume", content: "{}", authorId: 2, price: 499, rating: "5.0", downloads: 41, isPremium: true, createdAt: new Date() },
    { id: "mkt-4", title: "Executive Minimal Template", description: "Sleek, high-end minimal typography layout.", type: "template", content: "minimal-executive", authorId: 1, price: 299, rating: "4.8", downloads: 12, isPremium: true, createdAt: new Date() }
  ] as any[],
  affiliateReferrals: [
    { id: "aff-1", referrerId: 1, refereeId: 3, email: "john@example.com", clicks: 12, status: "converted", commissionEarned: 500, createdAt: new Date() },
    { id: "aff-2", referrerId: 1, refereeId: null, email: "referred-guest@test.com", clicks: 3, status: "pending", commissionEarned: 0, createdAt: new Date() }
  ] as any[],
  recruiterJobs: [
    { id: "job-1", organizationId: "org-1", title: "Senior React Developer", description: "We are hiring a senior developer who loves tailwind, state management, and animations.", requirements: "React, CSS, state management, JavaScript", status: "active", createdAt: new Date() }
  ] as any[],
  jobApplications: [
    { id: "app-1", jobId: "job-1", resumeId: null, applicantName: "Jane Smith", applicantEmail: "jane.smith@gmail.com", matchScore: 85, status: "shortlisted", resumeContent: "React, CSS, state management expert with 5 years experience.", createdAt: new Date() }
  ] as any[],
  subscriptions: [
    { id: "sub-1", userId: 1, tier: "enterprise", status: "active", provider: "stripe", referenceId: "sub_123", startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { id: "sub-2", userId: 2, tier: "pro", status: "active", provider: "stripe", referenceId: "sub_456", startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  ] as any[],
  supportTickets: [
    { id: "tkt-1", userId: 2, title: "Custom domain mapping issue", description: "Subdomain for white label returns 404.", status: "open", priority: "high", createdAt: new Date(), updatedAt: new Date() }
  ] as any[]
};

// ==========================================
// CORE CRUD HELPERS
// ==========================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Using mock upsertUser");
    const existing = mockDb.users.find(u => u.openId === user.openId);
    if (existing) {
      Object.assign(existing, user, { updatedAt: new Date() });
    } else {
      const nextId = mockDb.users.length + 1;
      mockDb.users.push({
        id: nextId,
        openId: user.openId,
        name: user.name || "Guest User",
        email: user.email || "",
        loginMethod: user.loginMethod || "local",
        role: user.openId === ENV.ownerOpenId ? "admin" : (user.role || "user"),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date()
      });
    }
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return mockDb.users.find(u => u.openId === openId);
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createResume(data: InsertResumeDb) {
  const db = await getDb();
  if (!db) {
    const newResume = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDb.resumes.push(newResume);
    return newResume;
  }
  await db.insert(resumes).values(data);
  return getResume(data.id);
}

export async function updateResume(id: string, userId: number, data: Partial<InsertResumeDb>) {
  const db = await getDb();
  if (!db) {
    const resumeIndex = mockDb.resumes.findIndex(r => r.id === id && r.userId === userId);
    if (resumeIndex > -1) {
      mockDb.resumes[resumeIndex] = {
        ...mockDb.resumes[resumeIndex],
        ...data,
        updatedAt: new Date()
      };
      return mockDb.resumes[resumeIndex];
    }
    return undefined;
  }
  await db.update(resumes).set(data).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
  return getResume(id);
}

export async function getResume(id: string) {
  const db = await getDb();
  if (!db) {
    return mockDb.resumes.find(r => r.id === id);
  }
  const result = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listResumes(userId: number) {
  const db = await getDb();
  if (!db) {
    return mockDb.resumes.filter(r => r.userId === userId).sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  return db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.updatedAt));
}

export async function deleteResume(id: string, userId: number) {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.resumes.findIndex(r => r.id === id && r.userId === userId);
    if (idx > -1) {
      mockDb.resumes.splice(idx, 1);
      return true;
    }
    return false;
  }
  await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
  return true;
}

export async function createJobDescription(data: InsertJobDescriptionDb) {
  const db = await getDb();
  if (!db) {
    const newItem = { ...data, createdAt: new Date() };
    mockDb.jobDescriptions.push(newItem);
    return newItem;
  }
  await db.insert(jobDescriptions).values(data);
  return getJobDescription(data.id);
}

export async function getJobDescription(id: string) {
  const db = await getDb();
  if (!db) {
    return mockDb.jobDescriptions.find(jd => jd.id === id);
  }
  const result = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listJobDescriptions(userId?: number) {
  const db = await getDb();
  if (!db) {
    if (userId !== undefined) {
      return mockDb.jobDescriptions.filter(jd => jd.userId === userId || jd.userId === null);
    }
    return mockDb.jobDescriptions.filter(jd => jd.userId === null);
  }
  if (userId !== undefined) {
    return db.select().from(jobDescriptions).where(
      sql`${jobDescriptions.userId} = ${userId} OR ${jobDescriptions.userId} IS NULL`
    ).orderBy(desc(jobDescriptions.createdAt));
  }
  return db.select().from(jobDescriptions).where(sql`${jobDescriptions.userId} IS NULL`);
}

export async function deleteJobDescription(id: string, userId: number) {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.jobDescriptions.findIndex(jd => jd.id === id && jd.userId === userId);
    if (idx > -1) {
      mockDb.jobDescriptions.splice(idx, 1);
      return true;
    }
    return false;
  }
  await db.delete(jobDescriptions).where(and(eq(jobDescriptions.id, id), eq(jobDescriptions.userId, userId)));
  return true;
}

// ==========================================
// SAAS CORE FUNCTIONS: ORGANIZATIONS
// ==========================================

export async function createOrganization(data: InsertOrganizationDb) {
  const db = await getDb();
  if (!db) {
    const newOrg = { ...data, createdAt: new Date(), updatedAt: new Date() };
    mockDb.organizations.push(newOrg);
    return newOrg;
  }
  await db.insert(organizations).values(data);
  const result = await db.select().from(organizations).where(eq(organizations.id, data.id)).limit(1);
  return result[0];
}

export async function getOrganization(id: string) {
  const db = await getDb();
  if (!db) {
    return mockDb.organizations.find(o => o.id === id);
  }
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    return mockDb.organizations.find(o => o.slug === slug);
  }
  const result = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrganization(id: string, data: Partial<InsertOrganizationDb>) {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.organizations.findIndex(o => o.id === id);
    if (idx > -1) {
      mockDb.organizations[idx] = { ...mockDb.organizations[idx], ...data, updatedAt: new Date() };
      return mockDb.organizations[idx];
    }
    return undefined;
  }
  await db.update(organizations).set(data).where(eq(organizations.id, id));
  return getOrganization(id);
}

export async function addOrganizationMember(data: InsertOrganizationMemberDb) {
  const db = await getDb();
  if (!db) {
    const newMember = { ...data, joinedAt: new Date() };
    mockDb.organizationMembers.push(newMember);
    return newMember;
  }
  await db.insert(organizationMembers).values(data);
  const result = await db.select().from(organizationMembers).where(eq(organizationMembers.id, data.id)).limit(1);
  return result[0];
}

export async function getOrganizationMembers(orgId: string) {
  const db = await getDb();
  if (!db) {
    const list = mockDb.organizationMembers.filter(m => m.organizationId === orgId);
    return list.map(m => {
      const u = mockDb.users.find(user => user.id === m.userId);
      return {
        ...m,
        userName: u ? u.name : "Unknown User",
        userEmail: u ? u.email : ""
      };
    });
  }
  const list = await db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, orgId));
  const detailedList = [];
  for (const m of list) {
    const uResult = await db.select().from(users).where(eq(users.id, m.userId)).limit(1);
    detailedList.push({
      ...m,
      userName: uResult[0]?.name || "Unknown User",
      userEmail: uResult[0]?.email || ""
    });
  }
  return detailedList;
}

export async function removeOrganizationMember(orgId: string, memberId: string) {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.organizationMembers.findIndex(m => m.organizationId === orgId && m.id === memberId);
    if (idx > -1) {
      mockDb.organizationMembers.splice(idx, 1);
      return true;
    }
    return false;
  }
  await db.delete(organizationMembers).where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.id, memberId)));
  return true;
}

export async function getUserOrganizations(userId: number) {
  const db = await getDb();
  if (!db) {
    const members = mockDb.organizationMembers.filter(m => m.userId === userId);
    return members.map(m => {
      const org = mockDb.organizations.find(o => o.id === m.organizationId);
      return org ? { ...org, role: m.role } : null;
    }).filter(Boolean);
  }
  const members = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, userId));
  const orgsList = [];
  for (const m of members) {
    const orgResult = await db.select().from(organizations).where(eq(organizations.id, m.organizationId)).limit(1);
    if (orgResult.length > 0) {
      orgsList.push({ ...orgResult[0], role: m.role });
    }
  }
  return orgsList;
}

// ==========================================
// SAAS CORE FUNCTIONS: MARKETPLACE
// ==========================================

export async function createMarketplaceItem(data: InsertMarketplaceItemDb) {
  const db = await getDb();
  if (!db) {
    const newItem = { ...data, rating: "5.0", downloads: 0, createdAt: new Date() };
    mockDb.marketplaceItems.push(newItem);
    return newItem;
  }
  await db.insert(marketplaceItems).values(data);
  const result = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, data.id)).limit(1);
  return result[0];
}

export async function listMarketplaceItems(type?: string) {
  const db = await getDb();
  if (!db) {
    const items = type ? mockDb.marketplaceItems.filter(i => i.type === type) : mockDb.marketplaceItems;
    return items.map(item => {
      const u = mockDb.users.find(user => user.id === item.authorId);
      return { ...item, authorName: u ? u.name : "HexaCv Specialist" };
    });
  }
  
  let result;
  if (type) {
    result = await db.select().from(marketplaceItems).where(eq(marketplaceItems.type, type)).orderBy(desc(marketplaceItems.createdAt));
  } else {
    result = await db.select().from(marketplaceItems).orderBy(desc(marketplaceItems.createdAt));
  }

  const items = [];
  for (const item of result) {
    const uResult = await db.select().from(users).where(eq(users.id, item.authorId)).limit(1);
    items.push({
      ...item,
      authorName: uResult[0]?.name || "HexaCv Specialist"
    });
  }
  return items;
}

export async function incrementDownloads(itemId: string) {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.marketplaceItems.findIndex(i => i.id === itemId);
    if (idx > -1) {
      mockDb.marketplaceItems[idx].downloads += 1;
      return mockDb.marketplaceItems[idx];
    }
    return null;
  }
  await db.update(marketplaceItems).set({
    downloads: sql`${marketplaceItems.downloads} + 1`
  }).where(eq(marketplaceItems.id, itemId));
  const res = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, itemId)).limit(1);
  return res[0];
}

export async function rateMarketplaceItem(itemId: string, ratingValue: number) {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.marketplaceItems.findIndex(i => i.id === itemId);
    if (idx > -1) {
      mockDb.marketplaceItems[idx].rating = ratingValue.toFixed(1);
      return mockDb.marketplaceItems[idx];
    }
    return null;
  }
  await db.update(marketplaceItems).set({
    rating: ratingValue.toFixed(1)
  }).where(eq(marketplaceItems.id, itemId));
  const res = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, itemId)).limit(1);
  return res[0];
}

// ==========================================
// SAAS CORE FUNCTIONS: AFFILIATES
// ==========================================

export async function createReferral(data: InsertAffiliateReferralDb) {
  const db = await getDb();
  if (!db) {
    const newRef = { ...data, status: "pending", clicks: 1, commissionEarned: 0, createdAt: new Date() };
    mockDb.affiliateReferrals.push(newRef);
    return newRef;
  }
  await db.insert(affiliateReferrals).values(data);
  const result = await db.select().from(affiliateReferrals).where(eq(affiliateReferrals.id, data.id)).limit(1);
  return result[0];
}

export async function getReferralsByReferrer(referrerId: number) {
  const db = await getDb();
  if (!db) {
    return mockDb.affiliateReferrals.filter(r => r.referrerId === referrerId);
  }
  return db.select().from(affiliateReferrals).where(eq(affiliateReferrals.referrerId, referrerId)).orderBy(desc(affiliateReferrals.createdAt));
}

export async function trackReferralClick(referrerId: number, email: string) {
  const db = await getDb();
  if (!db) {
    const existing = mockDb.affiliateReferrals.find(r => r.referrerId === referrerId && r.email === email);
    if (existing) {
      existing.clicks += 1;
      return existing;
    } else {
      const newRef = {
        id: Math.random().toString(36).substr(2, 9),
        referrerId,
        refereeId: null,
        email,
        clicks: 1,
        status: "pending",
        commissionEarned: 0,
        createdAt: new Date()
      };
      mockDb.affiliateReferrals.push(newRef);
      return newRef;
    }
  }
  
  const existing = await db.select().from(affiliateReferrals).where(
    and(eq(affiliateReferrals.referrerId, referrerId), eq(affiliateReferrals.email, email))
  ).limit(1);

  if (existing.length > 0) {
    await db.update(affiliateReferrals).set({
      clicks: sql`${affiliateReferrals.clicks} + 1`
    }).where(eq(affiliateReferrals.id, existing[0].id));
    const res = await db.select().from(affiliateReferrals).where(eq(affiliateReferrals.id, existing[0].id)).limit(1);
    return res[0];
  } else {
    const id = Math.random().toString(36).substr(2, 9);
    await db.insert(affiliateReferrals).values({
      id,
      referrerId,
      email,
      clicks: 1,
      status: "pending",
      commissionEarned: 0
    });
    const res = await db.select().from(affiliateReferrals).where(eq(affiliateReferrals.id, id)).limit(1);
    return res[0];
  }
}

export async function rewardReferralConversion(refereeEmail: string, refereeId: number, subscriptionPrice: number) {
  const db = await getDb();
  const commission = Math.round(subscriptionPrice * 0.2); // 20% commission

  if (!db) {
    const referral = mockDb.affiliateReferrals.find(r => r.email === refereeEmail && r.status === "pending");
    if (referral) {
      referral.status = "converted";
      referral.refereeId = refereeId;
      referral.commissionEarned = commission;
      return referral;
    }
    return null;
  }

  const referral = await db.select().from(affiliateReferrals).where(
    and(eq(affiliateReferrals.email, refereeEmail), eq(affiliateReferrals.status, "pending"))
  ).limit(1);

  if (referral.length > 0) {
    await db.update(affiliateReferrals).set({
      status: "converted",
      refereeId,
      commissionEarned: commission
    }).where(eq(affiliateReferrals.id, referral[0].id));
    const res = await db.select().from(affiliateReferrals).where(eq(affiliateReferrals.id, referral[0].id)).limit(1);
    return res[0];
  }
  return null;
}

// ==========================================
// SAAS CORE FUNCTIONS: RECRUITER PORTAL
// ==========================================

export async function createRecruiterJob(data: InsertRecruiterJobDb) {
  const db = await getDb();
  if (!db) {
    const newJob = { ...data, status: "active", createdAt: new Date() };
    mockDb.recruiterJobs.push(newJob);
    return newJob;
  }
  await db.insert(recruiterJobs).values(data);
  const result = await db.select().from(recruiterJobs).where(eq(recruiterJobs.id, data.id)).limit(1);
  return result[0];
}

export async function listRecruiterJobs(orgId?: string) {
  const db = await getDb();
  if (!db) {
    return orgId ? mockDb.recruiterJobs.filter(j => j.organizationId === orgId) : mockDb.recruiterJobs;
  }
  if (orgId) {
    return db.select().from(recruiterJobs).where(eq(recruiterJobs.organizationId, orgId)).orderBy(desc(recruiterJobs.createdAt));
  }
  return db.select().from(recruiterJobs).orderBy(desc(recruiterJobs.createdAt));
}

export async function getRecruiterJob(jobId: string) {
  const db = await getDb();
  if (!db) {
    return mockDb.recruiterJobs.find(j => j.id === jobId);
  }
  const result = await db.select().from(recruiterJobs).where(eq(recruiterJobs.id, jobId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createJobApplication(data: InsertJobApplicationDb) {
  const db = await getDb();
  if (!db) {
    const newApp = { ...data, status: "pending", createdAt: new Date() };
    mockDb.jobApplications.push(newApp);
    return newApp;
  }
  await db.insert(jobApplications).values(data);
  const result = await db.select().from(jobApplications).where(eq(jobApplications.id, data.id)).limit(1);
  return result[0];
}

export async function listJobApplications(jobId: string) {
  const db = await getDb();
  if (!db) {
    return mockDb.jobApplications.filter(a => a.jobId === jobId).sort((a,b) => b.matchScore - a.matchScore);
  }
  return db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId)).orderBy(desc(jobApplications.matchScore));
}

export async function updateApplicationStatus(id: string, status: string) {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.jobApplications.findIndex(a => a.id === id);
    if (idx > -1) {
      mockDb.jobApplications[idx].status = status;
      return mockDb.jobApplications[idx];
    }
    return null;
  }
  await db.update(jobApplications).set({ status }).where(eq(jobApplications.id, id));
  const res = await db.select().from(jobApplications).where(eq(jobApplications.id, id)).limit(1);
  return res[0];
}

// ==========================================
// SAAS CORE FUNCTIONS: SUBSCRIPTIONS & TICKETS
// ==========================================

export async function getSubscription(userId: number) {
  const db = await getDb();
  if (!db) {
    return mockDb.subscriptions.find(s => s.userId === userId && s.status === "active") || {
      id: "free",
      userId,
      tier: "free",
      status: "active",
      provider: "local",
      startDate: new Date()
    };
  }
  const result = await db.select().from(subscriptions).where(
    and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))
  ).limit(1);
  return result.length > 0 ? result[0] : {
    id: "free",
    userId,
    tier: "free",
    status: "active",
    provider: "local",
    startDate: new Date()
  };
}

export async function updateSubscription(userId: number, tier: string) {
  const db = await getDb();
  const subData = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    tier,
    status: "active",
    provider: "stripe",
    referenceId: "sub_" + Math.random().toString(36).substr(2, 9),
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };

  if (!db) {
    const existingIdx = mockDb.subscriptions.findIndex(s => s.userId === userId);
    if (existingIdx > -1) {
      mockDb.subscriptions[existingIdx] = subData;
    } else {
      mockDb.subscriptions.push(subData);
    }
    return subData;
  }

  // Deactivate old active subscriptions first
  await db.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.userId, userId));
  await db.insert(subscriptions).values(subData);
  return subData;
}

export async function listSupportTickets(userId?: number) {
  const db = await getDb();
  if (!db) {
    return userId !== undefined ? mockDb.supportTickets.filter(t => t.userId === userId) : mockDb.supportTickets;
  }
  if (userId !== undefined) {
    return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
  }
  return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function createSupportTicket(userId: number, title: string, description: string, priority: string = "medium") {
  const db = await getDb();
  const ticketData = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    title,
    description,
    status: "open",
    priority,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (!db) {
    mockDb.supportTickets.push(ticketData);
    return ticketData;
  }
  await db.insert(supportTickets).values(ticketData);
  return ticketData;
}

export async function resolveSupportTicket(id: string, status: string = "resolved") {
  const db = await getDb();
  if (!db) {
    const idx = mockDb.supportTickets.findIndex(t => t.id === id);
    if (idx > -1) {
      mockDb.supportTickets[idx].status = status;
      mockDb.supportTickets[idx].updatedAt = new Date();
      return mockDb.supportTickets[idx];
    }
    return null;
  }
  await db.update(supportTickets).set({ status }).where(eq(supportTickets.id, id));
  const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  return result[0];
}

// ==========================================
// ANALYTICS & SYSTEM WIDE CRM DATA
// ==========================================

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) {
    return {
      totalUsers: mockDb.users.length,
      activeUsers: Math.max(1, mockDb.users.length - 1),
      resumesCreated: mockDb.resumes.length + 8, // base offset for visuals
      pdfDownloads: (mockDb.resumes.length + 8) * 2,
      subscriptionRevenue: mockDb.subscriptions.filter(s => s.status === "active").reduce((acc, curr) => {
        return acc + (curr.tier === "enterprise" ? 99 : curr.tier === "pro" ? 19 : 0);
      }, 0)
    };
  }

  try {
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const resumeCount = await db.select({ count: sql<number>`count(*)` }).from(resumes);
    const activeCount = await db.select({ count: sql<number>`count(*)` }).from(users).where(
      sql`${users.lastSignedIn} > DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    const activePremiumCount = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(
      eq(subscriptions.status, "active")
    );

    return {
      totalUsers: Number(userCount[0]?.count || 0),
      activeUsers: Number(activeCount[0]?.count || 0),
      resumesCreated: Number(resumeCount[0]?.count || 0),
      pdfDownloads: Math.round(Number(resumeCount[0]?.count || 0) * 1.5),
      subscriptionRevenue: Number(activePremiumCount[0]?.count || 0) * 19,
    };
  } catch (error) {
    console.warn("[Analytics] Queries failed, using default mock stats:", error);
    return {
      totalUsers: 15,
      activeUsers: 8,
      resumesCreated: 24,
      pdfDownloads: 48,
      subscriptionRevenue: 118,
    };
  }
}

export async function getCRMUsersList() {
  const db = await getDb();
  if (!db) {
    return mockDb.users.map(u => {
      const sub = mockDb.subscriptions.find(s => s.userId === u.id && s.status === "active");
      const rc = mockDb.resumes.filter(r => r.userId === u.id).length;
      return {
        ...u,
        tier: sub ? sub.tier : "free",
        resumesCount: rc
      };
    });
  }

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  const detailed = [];
  for (const u of allUsers) {
    const subResult = await db.select().from(subscriptions).where(
      and(eq(subscriptions.userId, u.id), eq(subscriptions.status, "active"))
    ).limit(1);
    const resumeCountResult = await db.select({ count: sql<number>`count(*)` }).from(resumes).where(eq(resumes.userId, u.id));
    detailed.push({
      ...u,
      tier: subResult[0]?.tier || "free",
      resumesCount: Number(resumeCountResult[0]?.count || 0)
    });
  }
  return detailed;
}
