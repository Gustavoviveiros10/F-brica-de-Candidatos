export function CabecalhoPagina({ titulo, texto, direita }: { titulo: string; texto?: string; direita?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
      </div>
      {direita}
    </div>
  );
}
