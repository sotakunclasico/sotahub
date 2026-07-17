import { Navbar } from "./navbar";
import { Footer } from "./footer";
export function MarketingLayout({ children }: { children: React.ReactNode }) { return <div className="min-h-screen overflow-hidden"><Navbar/><main>{children}</main><Footer/></div>; }
