"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';

import prisma from "../db";
import { redirect } from "next/navigation";
import { Agency, Plans, SubAccounts, Users } from "@/app/generated/prisma";

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


export const getNotificationAndUser = async (agencyId: string) => {
    try {
        const response = await prisma.notifications.findMany({
            where: {
                agencyId,
            },
            include: {
                Users: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const updateAgencyDetails = async (agencyId: string, agencyDetails: Partial<Agency>) => {
    const res = await prisma.agency.update({ where: {id: agencyId}, data: {...agencyDetails}});
    return res
}

export const deleteAgencyDetails = async (agencyId: string) => {
    const res = await prisma.agency.delete({ where: { id: agencyId}});
    return res;
};

export const initUser = async (newUser: Partial<Users>) => {
    const user = await currentUser();
    if (!user) return;

    const updateUserData = await prisma.users.upsert({
        create:{
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} | ${user.lastName}`,
            role: newUser.role || "SUBACCOUNT_USER"
        },
        update: newUser,
        where: {
            email: user.emailAddresses[0].emailAddress
        }
    });

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || "SUBACCOUNT_USER",
        },
    });

    return updateUserData
};

export const upsertAgency = async (agency: Agency, plan?: Plans) => {
    if (!agency.companyEmail) return null;

    try {
        const agencyDetails = await prisma.agency.upsert({
            where: {id: agency.id},
            update: agency,
            create: {
                user: {
                    connect: { email: agency.companyEmail }
                },
                ...agency,
                SidebarOption: {
                    create: [
                        {
                            name: "Dashboard",
                            icon: "category",
                            link: `/agency/${agency.id}`,
                        },
                        {
                            name: "Lunchpad",
                            icon: "clipboardIcon",
                            link: `/agency/${agency.id}/lunchpad`,
                        },
                        {
                            name: "Billing",
                            icon: "payment",
                            link: `/agency/${agency.id}/billing`,
                        },
                        {
                            name: "Settings",
                            icon: "settings",
                            link: `/agency/${agency.id}/settings`,
                        },
                        {
                            name: "Sub Accounts",
                            icon: "person",
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                            name: "Team",
                            icon: "sheild",
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                    ]
                }
            } 
        })
    } catch (error) {
        
    }
};

export const upsertSubAccount = async (subAccount: SubAccounts) => {
    if (!subAccount.companyEmail) return null;

    const agencyOwner = await prisma.users.findFirst({
        where: {
            Agency: {
                id: subAccount.agencyId,
            },
            role: "AGENCY_OWNER",
        },
    });

    if (!agencyOwner) return console.log("Error could not create subaccount");
    const permissionId = uuidv4();
    const res = await prisma.subAccounts.upsert({
        where: { id: subAccount.id },
        update: subAccount,
        create: {
            ...subAccount,
            Permissions: {
                create: {
                    access: true,
                    email: agencyOwner.email,
                    id: permissionId,
                },
                connect: {
                    subAccontId: subAccount.id,
                    id: permissionId,
                },
            },
            Pipeline: {
                create: { name: "Lead Cycle" },
            },
            SidebarOption: {
                // create: [
                //     {
                //         name: "Launchpad",
                //         icon: "clipboardIcon",
                //         link: `/subaccount/${subAccount.id}/launchpad`,
                //     },
                //     {
                //         name: "Settings",
                //         icon: "settings",
                //         link: `/subaccount/${subAccount.id}/settings`,
                //     },
                //     {
                //         name: "Funnels",
                //         icon: "pipelines",
                //         link: `/subaccount/${subAccount.id}/funnels`,
                //     },
                //     {
                //         name: "Media",
                //         icon: "database",
                //         link: `/subaccount/${subAccount.id}/media`,
                //     },
                //     {
                //         name: "Automations",
                //         icon: "chip",
                //         link: `/subaccount/${subAccount.id}/automations`,
                //     },
                //     {
                //         name: "Pipelines",
                //         icon: "flag",
                //         link: `/subaccount/${subAccount.id}/pipelines`,
                //     },
                //     {
                //         name: "Contacts",
                //         icon: "person",
                //         link: `/subaccount/${subAccount.id}/contacts`,
                //     },
                //     {
                //         name: "Dashboard",
                //         icon: "category",
                //         link: `/subaccount/${subAccount.id}`,
                //     },
                // ],
            },
        },
    });

    return res;
};

export const _getTicketsWithAllRelations = async (laneId: string) => {
    const response = await prisma.tickets.findMany({
        where: { lineId: laneId },
        include: {
            Assigned: true,
            Customer: true,
            Lane: true,
            Tags: true,
        },
    });
    return response;
};