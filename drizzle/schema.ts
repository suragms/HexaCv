import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const resumes = mysqlTable("resumes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  templateId: varchar("templateId", { length: 50 }).notNull(),
  jobDescriptionId: varchar("jobDescriptionId", { length: 36 }),
  content: text("content").notNull(), // Serialized JSON content of the resume
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIndex: index("resumes_user_idx").on(table.userId),
}));

export type ResumeDb = typeof resumes.$inferSelect;
export type InsertResumeDb = typeof resumes.$inferInsert;

export const jobDescriptions = mysqlTable("job_descriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  keywords: text("keywords").notNull(), // Serialized JSON array of keywords
  isCustom: boolean("isCustom").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIndex: index("job_desc_user_idx").on(table.userId),
}));

export type JobDescriptionDb = typeof jobDescriptions.$inferSelect;
export type InsertJobDescriptionDb = typeof jobDescriptions.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  tier: varchar("tier", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  referenceId: varchar("referenceId", { length: 255 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
});

export type SubscriptionDb = typeof subscriptions.$inferSelect;
export type InsertSubscriptionDb = typeof subscriptions.$inferInsert;

export const supportTickets = mysqlTable("support_tickets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicketDb = typeof supportTickets.$inferSelect;
export type InsertSupportTicketDb = typeof supportTickets.$inferInsert;

// SaaS: Organizations (for tenants and white-labeling)
export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 50 }).default("#1e40af").notNull(),
  secondaryColor: varchar("secondaryColor", { length: 50 }).default("#0d9488").notNull(),
  customDomain: varchar("customDomain", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrganizationDb = typeof organizations.$inferSelect;
export type InsertOrganizationDb = typeof organizations.$inferInsert;

// SaaS: Organization Members
export const organizationMembers = mysqlTable("organization_members", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 36 }).notNull(),
  userId: int("userId").notNull(),
  role: varchar("role", { length: 50 }).default("collaborator").notNull(), // 'owner', 'recruiter', 'collaborator'
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("org_members_org_idx").on(table.organizationId),
  userIdx: index("org_members_user_idx").on(table.userId),
}));

export type OrganizationMemberDb = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMemberDb = typeof organizationMembers.$inferInsert;

// SaaS: Marketplace Templates and Public Resumes
export const marketplaceItems = mysqlTable("marketplace_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'resume' | 'template'
  content: text("content").notNull(), // Serialized JSON string of the template styles or resume section content
  authorId: int("authorId").notNull(),
  price: int("price").default(0).notNull(), // price in cents
  rating: varchar("rating", { length: 10 }).default("5.0").notNull(),
  downloads: int("downloads").default(0).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketplaceItemDb = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItemDb = typeof marketplaceItems.$inferInsert;

// SaaS: Affiliate / Referral System
export const affiliateReferrals = mysqlTable("affiliate_referrals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  referrerId: int("referrerId").notNull(),
  refereeId: int("refereeId"),
  email: varchar("email", { length: 320 }),
  clicks: int("clicks").default(1).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'joined', 'converted'
  commissionEarned: int("commissionEarned").default(0).notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  referrerIdx: index("aff_ref_referrer_idx").on(table.referrerId),
}));

export type AffiliateReferralDb = typeof affiliateReferrals.$inferSelect;
export type InsertAffiliateReferralDb = typeof affiliateReferrals.$inferInsert;

// SaaS: Recruiter Job Postings
export const recruiterJobs = mysqlTable("recruiter_jobs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 36 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(), // 'active', 'closed'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("recruiter_jobs_org_idx").on(table.organizationId),
}));

export type RecruiterJobDb = typeof recruiterJobs.$inferSelect;
export type InsertRecruiterJobDb = typeof recruiterJobs.$inferInsert;

// SaaS: Recruiter Job Applications / Candidate Pipelines
export const jobApplications = mysqlTable("job_applications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  jobId: varchar("jobId", { length: 36 }).notNull(),
  resumeId: varchar("resumeId", { length: 36 }),
  applicantName: varchar("applicantName", { length: 255 }).notNull(),
  applicantEmail: varchar("applicantEmail", { length: 320 }).notNull(),
  matchScore: int("matchScore").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'reviewed', 'shortlisted', 'rejected'
  resumeContent: text("resumeContent").notNull(), // Extracted resume text or json representation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  jobIdx: index("job_app_job_idx").on(table.jobId),
}));

export type JobApplicationDb = typeof jobApplications.$inferSelect;
export type InsertJobApplicationDb = typeof jobApplications.$inferInsert;