import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Wiccers — a little social magic",
    description: "Join the Wiccers circle. Share thoughts, discover your people, and leave a little magic behind.",
};
export default function WiccersLayout({ children }: {
    children: React.ReactNode;
}) {
    return children;
}
