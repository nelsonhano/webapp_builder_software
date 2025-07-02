"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";

import prisma from "../db";
import { redirect } from "next/navigation";
import { Users } from "@/app/generated/prisma";

export const getAuthenticatedUserData = async () => {
    const user = await currentUser()
    if (!user) return;

    const userDetails = await prisma.users.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        include: {
            Agency: {
                include: {
                    SidebarOption: true,
                    SubAccount: {
                        include:{
                            SidebarOption: true,
                        },
                    },
                },
            },
            Permission: true
        },
    });

    return userDetails;
};

export const saveActivitiesNotifications = async ({
    agencyId,
    description,
    subaccountId,
}:{
    agencyId?: string
    description: string
    subaccountId?: string
}) => {
    const user = await currentUser()
    let userData;

    if (!user) {
        const res = await prisma.users.findFirst({
            where: {
                Agency: {
                    SubAccount: {
                        some: { id: subaccountId},
                    },
                },
            },
        });
        if (res) userData = res;
    } else {
        userData = await prisma.users.findUnique({
            where: { email: user.emailAddresses[0].emailAddress}, 
        });
    };

    if (!userData) {
        console.log("Could not find a user");
        return;
    };

    let foundAgencyId = agencyId;
    if (!foundAgencyId) {
        if (!subaccountId) {
            throw new Error("You need to provide atleast an agency ID or subaccount ID");
        };

        const res = await prisma.subAccounts.findUnique({
            where: { id: subaccountId},
        });

        if (res) foundAgencyId = res.agencyId;
    };



    if (subaccountId) {
        await prisma.notifications.create({
            data: {
                notification: `${userData.name} | ${description}`,
                Users: {
                    connect: {
                        id: userData.id
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    }
                },
                SubAccounts: {
                    connect: { id: subaccountId },
                },
            },
        });
    } else {
        await prisma.notifications.create({
            data: { 
                notification: `${userData.name} | ${description}`,
                Users: {
                    connect: {
                        id: userData.id
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    }
                }
            },
        })
    };
};

export const createTeamUser = async (agencyId: string, user: Users) => {
    if (user.role === "AGENCY_OWNER") return null;
    const res = await prisma.users.create({ data: { ...user}});
    return res;
};

export const verifyAndAcceptInvite = async () => {
    const user = await currentUser()
    if (!user) redirect("/sign-in");
    const isInvitation = await prisma.invitations.findUnique({
        where: {email: user.emailAddresses[0].emailAddress, status: "PENDING"}
    });

    if(isInvitation) {
        const userDetails = await createTeamUser(isInvitation.agencyId, {
            email: isInvitation.email,
            agencyId: isInvitation.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: isInvitation.role,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await saveActivitiesNotifications({
            agencyId: isInvitation.agencyId,
            description: `Joined`,
            subaccountId: undefined,
        });

        if (userDetails) {
            const clerk = await clerkClient();
            await clerk.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || "SUBACCOUNT_USER",
                },
            });

            await prisma.invitations.delete({
                where: { email: userDetails.email },
            });

            return userDetails.agencyId
        } else return null;
    } else {
        const agency = await prisma.users.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress,
            },
        });
        return agency ? agency.agencyId : null;
    };
};