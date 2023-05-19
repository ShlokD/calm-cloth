import "@/styles/globals.css";
import Link from "next/link";
import Image from "next/image";

export default function App({ Component, pageProps }) {
  return (
    <>
      <header>
        <Link href="/">
          <div className="flex p-2 items-center justify-center">
            <Image src="/logo.png" height="48" width="48" alt="" />
            <h1 className="mx-4 text-4xl text-bold">Calm Cloth</h1>
          </div>
        </Link>
      </header>
      <Component {...pageProps} />
      <footer className="bottom-0 p-4">Designed using Open Trivia DB</footer>
    </>
  );
}
