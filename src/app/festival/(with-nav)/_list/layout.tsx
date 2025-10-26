interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default async function Layout({ children, modal }: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
