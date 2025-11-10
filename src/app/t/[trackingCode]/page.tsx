import TrackingRedirect from '@/components/TrackingRedirect';

export const dynamicParams = true;

export function generateStaticParams() {
  // Return empty array - routes will be handled client-side
  return [];
}

export default function TrackingPage() {
  return <TrackingRedirect />;
}
