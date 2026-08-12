import Link from "next/link";
import Image from "next/image";
import type { Frame } from "@/lib/types";
import styles from "./ProductCard.module.css";

export function ProductCard({ frame }: { frame: Frame }) {
  return (
    <Link href={`/catalogue/${frame.slug}`} className={styles.card}>
      <Image
        src={frame.images[0]}
        alt={frame.nom}
        width={320}
        height={200}
        className={styles.image}
      />
      <div className={styles.info}>
        <p className={styles.marque}>{frame.marque}</p>
        <h3 className={styles.nom}>{frame.nom}</h3>
        <p className={styles.prix}>{frame.prix} €</p>
      </div>
    </Link>
  );
}
