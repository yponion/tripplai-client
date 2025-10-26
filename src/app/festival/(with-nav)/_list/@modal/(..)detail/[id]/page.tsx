import FestivalDetail from "@/app/festival/_components/FestivalDetail";
import ModalWrapper from "@/app/festival/_components/ModalWrapper";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <ModalWrapper>
      <FestivalDetail id={id} />
    </ModalWrapper>
  );
}
