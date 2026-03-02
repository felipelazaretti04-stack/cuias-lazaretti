import EditCategoryClient from "./EditCategoryClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCategoryClient categoryId={id} />;
}
