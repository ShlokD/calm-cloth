const shuffle = (arr) => {
  const shuffled = [];
  const seen = {};
  while (true) {
    const index = Math.floor(Math.random() * arr.length);
    const elem = arr[index];
    if (!seen[elem]) {
      shuffled.push(elem);
      seen[elem] = true;
    }
    if (shuffled.length === arr.length) {
      break;
    }
  }
  return shuffled;
};

const formatQuestions = (q) => {
  return {
    questions: q.results.map((result) => {
      const options = shuffle([
        result["correct_answer"],
        ...result["incorrect_answers"],
      ]);
      return {
        title: result.question,
        options,
        correct: options.indexOf(result["correct_answer"]),
        answered: false,
      };
    }),
  };
};

export default async function handler(req, res) {
  try {
    const apiRes = await fetch("https://opentdb.com/api.php?amount=5");
    const questions = await apiRes.json();
    res.status(200).json(formatQuestions(questions));
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
