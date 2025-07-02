import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/site',
    '/api/uploadthing',
    "/agency/sign-in",
    "/agency/sign-up",
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    const url = req.nextUrl;
    const searchParams = url.searchParams.toString();
    const hostname = req.headers;

    const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

    const customSubDomain = hostname
        .get("host")
        ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
        .filter(Boolean)[0];

    if (customSubDomain) {
        return NextResponse.rewrite(new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url));
    }

    if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
        return NextResponse.redirect(new URL("/agency/sign-in", req.url));
    }

    if (
        url.pathname === "/" ||
        url.pathname === "/site" ||
        url.pathname === process.env.NEXT_PUBLIC_DOMAIN
    ) {
        return NextResponse.rewrite(new URL("/site", req.url));
    }

    if (
        url.pathname.startsWith("/agency") ||
        url.pathname.startsWith("/subaccount")
    ) {
        return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
