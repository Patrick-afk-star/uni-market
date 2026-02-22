import AuthNav from "../../components/auth/AuthNav";
import "../globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={` antialiased flex flex-col min-h-screen`}>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
