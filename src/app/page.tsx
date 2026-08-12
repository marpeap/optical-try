import Link from "next/link";
import { ScrollVideo } from "@/components/landing/ScrollVideo";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      <ScrollVideo />
      <section className={styles.hero}>
        <h1>Des lunettes qui vous ressemblent</h1>
        <p>Essayez-les virtuellement, en haute qualité, avant de commander.</p>
        <Link href="/catalogue" className={styles.cta}>
          Découvrir le catalogue
        </Link>
      </section>
    </main>
  );
}
