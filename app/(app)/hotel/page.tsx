import { getHotelData, getPetsWithOwner } from "@/lib/supabase/queries";
import { HotelView } from "@/components/hotel/HotelView";

export const dynamic = "force-dynamic";

export default async function HotelPage() {
  const [hotel, pets] = await Promise.all([getHotelData(), getPetsWithOwner()]);
  return <HotelView rooms={hotel.rooms} stays={hotel.stays} reports={hotel.reports} pets={pets} />;
}
