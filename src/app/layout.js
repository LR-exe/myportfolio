import "./globals.css";
export const metadata = {
  title: "Lokesh Rathi | Developer & Co-Founder",
  description: "Lokesh Rathi â€” Full-Stack Developer, Co-Founder and Technical Mentor.",
};
export default function RootLayout({ children }) {
  return <html lang="en"><body className="m-0 bg-white text-black font-sans antialiased">{children}</body></html>;
}
