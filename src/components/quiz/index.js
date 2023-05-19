import { useState, useEffect, useRef } from "preact/hooks";

const OptionButton = ({ children, ...rest }) => {
  return (
    <button
      className={`p-4 rounded-2xl my-2 w-10/12 bg-gray-100 text-gray-900 text-xl`}
      {...rest}
    >
      {children}
    </button>
  );
};

const messages = [
  "You didn't even get a single point! That's embarrassing.",
  "You got a point! That's something.",
  "You did ok! Practice some more and you'll improve",
  "You got a few right! Try to do better tomorrow",
  "Almost a full score. Good job",
  "You've won by a perfect score! You're a true champion.",
];

const Quiz = () => {
  const [time, setTime] = useState(60);
  const [gameState, setGameState] = useState("READY");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const timer = useRef(null);

  const fetchQuestions = async () => {
    const res = await fetch("/api/questions");
    const json = await res.json();
    setQuestions(json.questions);
    setGameState("START");
  };

  useEffect(() => {
    if (!questions) {
      return;
    }

    timer.current = setInterval(() => {
      setTime((prev) => {
        if (prev === 0) {
          if (gameState !== "GAME_OVER") {
            setGameState("GAME_OVER");
          }
          return prev;
        } else {
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer.current);
  }, [questions]);

  useEffect(() => {
    if (questions.length === 0) {
      fetchQuestions();
    }
  }, [questions]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestion === questions.length) {
      setGameState("COMPLETE");
    }
  }, [currentQuestion, questions]);

  useEffect(() => {
    return () => {
      setGameState("READY");
    };
  }, []);

  const onOptionSelected = (option) => {
    if (gameState === "GAME_OVER" || gameState === "COMPLETE") {
      return;
    }

    if (option === questions[currentQuestion].correct) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      setCurrentQuestion((prev) => {
        if (prev >= questions.length) {
          return prev;
        } else {
          return prev + 1;
        }
      });
    }, 500);
  };

  if (gameState === "GAME_OVER" || gameState === "COMPLETE") {
    clearInterval(timer.current);
  }

  if (gameState === "READY") {
    return null;
  }

  if (currentQuestion === questions.length) {
    return (
      <div className="flex flex-col items-center justify-center m-auto">
        <p className="text-4xl text-center m-auto">{score} / 5</p>
        <p className="text-2xl text-center my-2">{messages[score]}</p>
      </div>
    );
  }

  if (gameState === "GAME_OVER") {
    return <p className="text-4xl text-center m-auto">Sorry! Time is up</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center w-full my-2">
      <div className="flex items-center justify-center">
        <p className="block text-3xl w-16 h-16 text-center border-4 border-yellow-200 rounded-full py-3 my-2">
          {time}
        </p>
        <p className="inline text-3xl mx-2 w-16 h-16 text-center border-4 border-green-200 rounded-full py-3 my-2">
          {score}
        </p>
      </div>
      <div className="border-2 border-green-200 p-8 rounded-lg w-full">
        <p
          className="text-bold text-3xl text-center w-full"
          dangerouslySetInnerHTML={{ __html: questions[currentQuestion].title }}
        ></p>
      </div>
      <div className="flex flex-col my-2 w-full items-center justify-evenly">
        {questions[currentQuestion].options.map((option, i) => {
          return (
            <OptionButton
              onClick={() => onOptionSelected(i)}
              key={`option-${i}`}
            >
              {option}
            </OptionButton>
          );
        })}
      </div>
    </main>
  );
};

export default Quiz;
