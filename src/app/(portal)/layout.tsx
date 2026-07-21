import { Navbar } from "@/layouts/navbar";
export default function Layout({children}:{children:React.ReactNode}){return <div className="min-h-screen"><Navbar/><main id="main-content" className="shell py-10">{children}</main></div>}
