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

const saveStateToLocalStorage = ({ gameState, score }) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setHours(24, 0, 0, 0);
  const payload = {
    gameState,
    score,
    expiry: date.getTime(),
  };
  localStorage.setItem("gameState", JSON.stringify(payload));
};

const saveQuestionsToLocalStorage = ({
  questions,
  currentQuestion,
  score,
  time,
}) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setHours(24, 0, 0, 0);
  const payload = {
    questions,
    currentQuestion,
    time,
    score,
    expiry: date.getTime(),
  };
  localStorage.setItem("questions", JSON.stringify(payload));
};

const Quiz = () => {
  const [time, setTime] = useState(60);
  const [gameState, setGameState] = useState("INIT");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const timer = useRef(null);
  const gameStateRef = useRef("INIT");
  const currentQuestionRef = useRef(0);
  const questionsRef = useRef([]);
  const scoreRef = useRef(0);
  const timeRef = useRef(60);

  const fetchQuestions = async () => {
    const res = await fetch("/api/questions");
    const json = await res.json();
    setQuestions(json.questions);
    setGameState("START");
    setTime(60);
    gameStateRef.current = "START";
    questionsRef.current = json.questions;
    timeRef.current = 60;
    currentQuestionRef.current = 0;
  };

  useEffect(() => {
    const storedStateRaw = localStorage.getItem("gameState");
    const storedState = JSON.parse(storedStateRaw);
    if (storedState?.expiry > Date.now()) {
      setGameState(storedState?.gameState);
      setScore(storedState?.score);
      gameStateRef.current = storedState?.gameState;
      scoreRef.current = storedState?.score;
    } else {
      localStorage.removeItem("gameState");
      setGameState("READY");
      gameStateRef.current = "START";
    }
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      if (gameStateRef.current === "START" && questionsRef.current.length > 0) {
        saveQuestionsToLocalStorage({
          questions: questionsRef.current,
          currentQuestion: currentQuestionRef.current,
          time: timeRef.current,
          score: scoreRef.current,
        });
        return "Are you sure?";
      }
    });

    return () => {
      if (gameStateRef.current === "START" && questionsRef.current.length > 0) {
        saveQuestionsToLocalStorage({
          questions: questionsRef.current,
          currentQuestion: currentQuestionRef.current,
          time: timeRef.current,
          score: scoreRef.current,
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!questions || gameState === "COMPLETE") {
      return;
    }

    timer.current = setInterval(() => {
      setTime((prev) => {
        if (prev === 0) {
          if (gameState !== "GAME_OVER") {
            setGameState("GAME_OVER");
            gameStateRef.current = "GAME_OVER";
            saveStateToLocalStorage({ gameState: "GAME_OVER", score });
          }
          timeRef.current = prev;
          return prev;
        } else {
          timeRef.current = prev - 1;
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer.current);
  }, [questions]);

  useEffect(() => {
    if (questions?.length === 0 && gameState === "READY") {
      const storedQuestionsRaw = localStorage.getItem("questions");
      const storedQuestions = JSON.parse(storedQuestionsRaw);
      if (storedQuestions && storedQuestions.expiry > Date.now()) {
        setQuestions(storedQuestions.questions);
        setCurrentQuestion(storedQuestions.currentQuestion);
        setTime(storedQuestions.time);
        setScore(storedQuestions.score);
        questionsRef.current = storedQuestions.questions;
        currentQuestionRef.current = storedQuestions.currentQuestion;
        timeRef.current = storedQuestions.time;
        scoreRef.current = storedQuestions.score;
        setGameState("START");
        gameStateRef.current = "START";
      } else {
        localStorage.removeItem("questions");
        fetchQuestions();
      }
    }
  }, [questions, gameState]);

  useEffect(() => {
    if (questions?.length > 0 && currentQuestion === questions.length) {
      setGameState("COMPLETE");
      gameStateRef.current = "COMPLETE";
      saveStateToLocalStorage({ gameState: "COMPLETE", score });
      localStorage.removeItem("questions");
    }
  }, [currentQuestion, questions]);

  const onOptionSelected = (option) => {
    if (gameState === "GAME_OVER" || gameState === "COMPLETE") {
      return;
    }

    if (option === questions[currentQuestion].correct) {
      setScore((prev) => {
        scoreRef.current = prev + 1;
        return prev + 1;
      });
    }

    setTimeout(() => {
      setCurrentQuestion((prev) => {
        if (prev >= questions.length) {
          currentQuestionRef.current = prev;
          return prev;
        } else {
          currentQuestionRef.current = prev + 1;
          return prev + 1;
        }
      });
    }, 500);
  };

  if (gameState === "GAME_OVER" || gameState === "COMPLETE") {
    clearInterval(timer.current);
  }

  if (gameState === "GAME_OVER") {
    return (
      <div className="flex flex-col items-center justify-center m-auto">
        <p className="text-4xl text-center m-auto">Sorry. Time is up</p>
        <p className="text-xl text-center my-1">Try again tomorrow</p>
      </div>
    );
  }

  if (
    (questions?.length > 0 && currentQuestion === questions.length) ||
    gameState === "COMPLETE"
  ) {
    return (
      <div className="flex flex-col items-center justify-center m-auto">
        <p className="text-4xl text-center m-auto">{score} / 5</p>
        <p className="text-2xl text-center my-2">{messages[score]}</p>
        <p className="text-xl text-center my-1">Try again tomorrow</p>
      </div>
    );
  }

  if (gameState === "READY" || gameState === "INIT") {
    return (
      <div role="status" className="m-auto">
        <svg
          aria-hidden="true"
          class="w-20 h-20 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-200"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    );
  }

  if (!questions) {
    return null;
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
              dangerouslySetInnerHTML={{ __html: option }}
            ></OptionButton>
          );
        })}
      </div>
    </main>
  );
};

export default Quiz;
