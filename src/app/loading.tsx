export default function Loading() {
  return <div className="shell min-h-[70vh] py-20" role="status" aria-label="Cargando contenido">
    <div className="h-5 w-40 animate-pulse bg-[#9b7139]/20"/>
    <div className="mt-7 h-14 max-w-2xl animate-pulse bg-[#d8c5a4]/10"/>
    <div className="mt-4 h-5 max-w-xl animate-pulse bg-[#d8c5a4]/[.06]"/>
    <div className="mt-12 grid gap-5 md:grid-cols-3">{[0,1,2].map(item => <div className="glass-panel h-64 animate-pulse" key={item}/>)}</div>
    <span className="sr-only">Cargando…</span>
  </div>;
}
