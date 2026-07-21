import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" aria-label="Ir al inicio de SotaKun" className="group flex items-center gap-2">
      <span className="relative block size-14 overflow-hidden">
        <Image src="/assets/sotakun/logo-mark.png" alt="" fill priority sizes="56px" className="scale-[1.8] object-contain transition duration-500 group-hover:scale-[1.9] group-hover:brightness-125" />
      </span>
      <span className="font-serif text-2xl italic tracking-[-.06em] text-[#d5b57b] transition group-hover:text-[#f0d7a5]">SotaKun</span>
    </Link>
  );
}
