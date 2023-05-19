import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex flex-col my-6">
        <p className="py-4 text-center text-bold text-2xl">
          Answer daily trivia questions
        </p>
        <p className="py-4 text-center text-bold text-2xl">
          1 minute, 5 Questions
        </p>
        <p className="py-4 text-center text-bold text-2xl">
          Questions are updated at midnight
        </p>
      </div>
      <hr className="border-white border-2 w-full" />
      <div className="bg-gradient-to-b p-8 from-green-200 to-green-300 my-4 rounded-full text-3xl text-gray-900">
        <Link href="/quiz">Start Quiz</Link>
      </div>
    </main>
  );
}
