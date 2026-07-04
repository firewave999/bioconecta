import "./auth.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="auth-shell">{children}</div>;
}
