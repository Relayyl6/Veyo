import {Ride} from "@/types/type";

export const sortRides = (rides: Ride[]): Ride[] => {
    const result = rides.sort((a, b) => {
        const dateA = new Date(`${a.created_at}T${a.ride_time}`);
        const dateB = new Date(`${b.created_at}T${b.ride_time}`);
        return dateB.getTime() - dateA.getTime();
    });

    return result.reverse();
};

export function formatTime(minutes: number): string {
    const formattedMinutes = +minutes?.toFixed(0) || 0;

    if (formattedMinutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(formattedMinutes / 60);
        const remainingMinutes = formattedMinutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
}

export function formatDate(dateString: string | number | null): string {
    if (dateString === null || dateString === undefined) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day < 10 ? "0" + day : day} ${month} ${year}`;
}

// --- MOCK DATA ---
export const discoveryData = [
  { id: '1', tag: 'HOT DEALS', tagColor: 'bg-[#E65100]', title: '50% Off Lunch', subtitle: 'Valid till 2PM today', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop' },
  { id: '2', tag: 'TRENDING', tagColor: 'bg-[#6D28D9]', title: 'The Lagos Special', subtitle: '1.2k check-ins', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop' },
  { id: '3', tag: 'NEW', tagColor: 'bg-[#059669]', title: 'Vegan Delights', subtitle: 'Try our new menu', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop' },
  { id: '4', tag: 'PREMIUM', tagColor: 'bg-[#DC2626]', title: 'Steakhouse Cuts', subtitle: 'Reserve your table', image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=800&auto=format&fit=crop' },
  { id: '5', tag: 'POPULAR', tagColor: 'bg-[#D97706]', title: 'Late Night Cravings', subtitle: 'Open till 3AM', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop' },
];

export const nearbyData = [
  { id: '1', title: 'Burgers & Co.', category: 'American • Burgers • Quick Bite', rating: '4.8', time: '25-35 mins', deliveryInfo: 'Free Delivery', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },
  { id: '2', title: 'Green Harvest', category: 'Salads • Healthy • Vegan', rating: '4.5', time: '15-25 mins', deliveryInfo: '₦1,200 Delivery', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop' },
];