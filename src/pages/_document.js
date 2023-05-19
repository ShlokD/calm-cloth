import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@700&family=Poppins:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta
          name="description"
          content="Play a daily quiz. 5 questions in a minute"
        />
        <title>Calm Cloth - Daily Quiz</title>
      </Head>
      <body className="bg-gray-800 text-white p-2">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
