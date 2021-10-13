import inquirer from "inquirer";

const confirm = (question) => {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "confirm",
          name: "choice",
          message: question,
          default: false,
        },
      ])
      .then((answers) => resolve(answers.question))
      .catch((error) => resolve(false));
  });
};

export default confirm;
