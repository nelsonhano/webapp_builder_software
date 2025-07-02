import { getAuthenticatedUserData, verifyAndAcceptInvite } from '@/lib/actions/queries';

export default async function page() {
  const agencyId = await verifyAndAcceptInvite();
  console.log(agencyId);
  
  //Get single user data
  const userDetails = await getAuthenticatedUserData();

  return (
    <div>
      Agency
    </div>
  )
}
