export const metadata = {
  title: "Penguin Trailers — CMS",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      {children}
    </div>
  );
}
