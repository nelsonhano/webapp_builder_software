import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getNotificationAndUser, verifyAndAcceptInvite } from "@/lib/actions/queries";
import BlurPage from "@/components/global/blur-page";
import Unauthorized from "@/components/unauthorized";
import { ChildrenProps } from "../../../../../@types";
import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/sidebar";
// import { getNotificationAndUser, verifyAndAcceptInvitation } from "@/lib/queries";

type Props = {
    params: {
        agencyId: string;
    };
} & ChildrenProps;

const Layout = async ({ children, params }: Props) => {
    const agencyId = await verifyAndAcceptInvite();
    const user = await currentUser();

    if (!user) {
        return redirect("/");
    }

    if (!agencyId) {
        return redirect(`/agency`);
    }

    if (user.privateMetadata.role !== "AGENCY_OWNER" && user.privateMetadata.role !== "AGENCY_ADMIN") return <Unauthorized />;

    let allNoti: any = [];
    const notifications = await getNotificationAndUser(agencyId);
    if (notifications) allNoti = notifications;

    return (
        <div className="h-screen overflow-hidden">
            <Sidebar id={params.agencyId} type="agency" />
            <div className="md:pl-[300px]">
                <InfoBar notifications={allNoti} role={allNoti.User?.role} />
                <div className="relative">
                    <BlurPage>{children}</BlurPage>
                </div>
            </div>
        </div>
    );
};

export default Layout;
