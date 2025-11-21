import OrganizationInvite from '@/components/OrganizationInvite';

export const dynamicParams = true;

export function generateStaticParams() {
  // Return empty array - routes will be handled client-side
  return [];
}

export default function OrganizationInvitePage() {
  return <OrganizationInvite />;
}
