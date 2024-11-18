import "@/app/globals.css";

export const metadata = {
  title: "Sidebar Navigation App",
  description: "A simple Next.js app with sidebar navigation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
