import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = async (req: Request) => {
    const user = await currentUser();
    if (!user) throw new UploadThingError("Unauthorized");
    return { id: user.id };
};

export const ourFileRouter = {
    subAccountLogo: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    }).middleware(async ({ req }) => {
            const user = await auth(req);

            if (!user) throw new UploadThingError("Unauthorized");

            return { userId: user.id };
        }).onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.ufsUrl);

            return { uploadedBy: metadata.userId };
        }),
    
    avatar: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    }).middleware(async ({ req }) => {
        const user = await auth(req);

        if (!user) throw new UploadThingError("Unauthorized");

        return { userId: user.id };
    }).onUploadComplete(async ({ metadata, file }) => {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.ufsUrl);

        return { uploadedBy: metadata.userId };
        }),

    agencyLogo: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    }).middleware(async ({ req }) => {
        const user = await auth(req);

        if (!user) throw new UploadThingError("Unauthorized");

        return { userId: user.id };
    }).onUploadComplete(async ({ metadata, file }) => {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.ufsUrl);

        return { uploadedBy: metadata.userId };
            }),

    media: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    }).middleware(async ({ req }) => {
        const user = await auth(req);

        if (!user) throw new UploadThingError("Unauthorized");

        return { userId: user.id };
    }).onUploadComplete(async ({ metadata, file }) => {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.ufsUrl);

        return { uploadedBy: metadata.userId };
                }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
