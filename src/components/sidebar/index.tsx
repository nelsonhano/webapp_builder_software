import React from "react";
import MenuOptions from "./menu-option";
import { getAuthenticatedUserData } from "@/lib/actions/queries";

type Props = {
    id: string;
    type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
    const user = await getAuthenticatedUserData();

    if (!user) return;

    if (!user.Agency) return;

    const details = type === "agency" ? user?.Agency : user?.Agency.SubAccount.find((subaccount) => subaccount.id === id);

    const isWhiteLabeledAgency = user.Agency.whiteLabel;
    if (!details) return;

    let sideBarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg";

    if (!isWhiteLabeledAgency) {
        if (type === "subaccount") {
            sideBarLogo = user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.subAcctountLogo || user.Agency.agencyLogo;
        }
    }

    const sidebarOpt = type === "agency" ? user.Agency.SidebarOption || [] : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.SidebarOption || [];

    const subaccounts = user.Agency.SubAccount.filter((subaccount) => user.Permission.find((permission) => permission.subAccontId === subaccount.id && permission.access));

    return (
        <>
            <MenuOptions defaultOpen={true} details={details} id={id} sidebarLogo={sideBarLogo} sidebarOpt={sidebarOpt} subAccounts={subaccounts} user={user} />
            <MenuOptions details={details} id={id} sidebarLogo={sideBarLogo} sidebarOpt={sidebarOpt} subAccounts={subaccounts} user={user} />
        </>
    );
};

export default Sidebar;
