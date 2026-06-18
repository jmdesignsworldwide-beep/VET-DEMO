import { getGroomingData, getPetsWithOwner } from "@/lib/supabase/queries";
import { GroomingView } from "@/components/grooming/GroomingView";

export const dynamic = "force-dynamic";

export default async function PeluqueriaPage() {
  const [grooming, pets] = await Promise.all([getGroomingData(), getPetsWithOwner()]);
  return <GroomingView appointments={grooming.appointments} photos={grooming.photos} pets={pets} />;
}
