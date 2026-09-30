import MainLayout from "@/layouts/MainLayout";

export default function Layout({ children }) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
