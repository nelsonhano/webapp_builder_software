// This file contains shared types for your Prisma models and other domain types.
// Some types depend on the return types of async query functions.

// Import Prisma client models
import { Contacts, Lane, Role, Tags, Tickets } from "@/app/generated/prisma";

// Import zod for schema validation
import { z } from "zod";

// Import your prisma instance
import prisma from "./db";

// Import Prisma namespace for types (e.g., Prisma.JsonValue)
import { Prisma } from "@prisma/client";

// Import Clerk's User type for assigned user info
import { User } from "@clerk/nextjs/server";

// Import Stripe types - Make sure you have installed 'stripe' package
import Stripe from "stripe";
import { _getTicketsWithAllRelations } from "./actions/queries";

// ----------------------------------------------
// Fix for TS2694: Prisma.PromiseReturnType doesn't exist
// Use Awaited<ReturnType<typeof func>> to get the resolved return type of async functions

// Ticket details type inferred from _getTicketsWithAllRelations query function
export type TicketDetails = Awaited<ReturnType<typeof _getTicketsWithAllRelations>>;

// ----------------------------------------------
// Custom complex types combining Prisma models and relations

export type NotificationWithUser =
    | ({
        User: {
            id: string;
            name: string;
            avatarUrl: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            role: Role;
            agencyId: string | null;
        };
    } & Notification)[]
    | undefined;

// Ticket combined with related tags, assigned user, and customer contact
export type TicketAndTags = Tickets & {
    Tags: Tags[];
    Assigned: User | null;
    Customer: Contacts | null;
};

// Lane with its tickets and nested relations
export type LaneDetails = Lane & {
    Tickets: TicketAndTags[];
};

// Stripe API price list type
export type PricesList = Stripe.ApiList<Stripe.Price>;

// ----------------------------------------------
// Zod schemas for validating form inputs

export const CreateFunnelFormSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    subDomainName: z.string().optional(),
    favicon: z.string().optional(),
});

export const FunnelPageSchema = z.object({
    name: z.string().min(1),
    pathName: z.string().optional(),
});

export const ContactUserFormSchema = z.object({
    name: z.string().min(1, "Required"),
    email: z.string().email(),
});
