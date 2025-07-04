import { redirect } from 'next/navigation';

import { getAuthenticatedUserData, verifyAndAcceptInvite } from '@/lib/actions/queries';
import { Plans } from '@/app/generated/prisma';
import { currentUser } from '@clerk/nextjs/server';
import AgencyDetails from '@/components/form/agency-details';

export default async function page({ searchParams }: { 
  searchParams: { plan: Plans, state: string, code: string } 
}) {
  const agencyId = await verifyAndAcceptInvite();
  
  const userDetails = await getAuthenticatedUserData();
  if (agencyId) {
    if (userDetails?.role === "SUBACCOUNT_GUEST" || userDetails?.role === "SUBACCOUNT_USER") {
      return redirect("/subaccount");
    } else if (userDetails?.role === "AGENCY_OWNER" || userDetails?.role === "AGENCY_ADMIN"){

      if (searchParams.plan) {
        return redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`)
      };

      if (searchParams.state) {
        const statePath = searchParams.state.split("__")[0];
        const stateAgencyId = searchParams.state.split("__")[1];

        if (!stateAgencyId) return <div>Page Not Authorized</div>;
        return redirect(`/agency/${stateAgencyId}/${statePath}?code=${searchParams.state}`)
      } else {
        return redirect(`/agency/${agencyId}`);
      };
    } else {
      return <div>Page Not Authorized</div>;
    };
  };
  const authUser = await currentUser();

  return (
    <div className=' flex justify-center items-center mt-4'>
      <div className='max-w-[850px] border-[1px] p-4 rounded-xl'>
        <h1 className='text-4xl'>Create An Agency</h1>
        <AgencyDetails data={{companyEmail: authUser?.emailAddresses[0].emailAddress}}/>
      </div>
    </div>
  )
}
