import { Logo } from "@/components/shared/logo";
export default function Layout({children}:{children:React.ReactNode}){return <main className="relative grid min-h-screen place-items-center overflow-hidden p-5"><div className="orb left-1/2 top-1/4 -translate-x-1/2"/><div className="relative w-full max-w-md"><div className="mb-8 flex justify-center"><Logo/></div>{children}</div></main>}
