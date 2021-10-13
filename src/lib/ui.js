import chalk from "chalk";

const split = (str, maxLength = 80) => {
  const wsLookup = 15; // Look backwards n characters for a whitespace
  const regex = new RegExp(
    String.raw`\s*(?:(\S{${maxLength}})|([\s\S]{${
      maxLength - wsLookup
    },${maxLength}})(?!\S))`,
    "g"
  );
  return str
    .split("\n")
    .map((line) => line.replace(regex, (_, x, y) => (x ? `${x}-\n` : `${y}\n`)))
    .map((line) => line.trim())
    .join("\n");
};

export const h1 = (message) => {
  message = split(message);
  console.log(chalk.blue.underline.bold("# " + message));
};

export const h2 = (message) => {
  message = split(message);
  console.log(chalk.blue.bold("## " + message));
};

export const h3 = (message) => {
  message = split(message);
  console.log(chalk.bold("### " + message));
};

export const separator = (sepLength = 80, maxLength = 80) => {
  const spaceBefore = Math.floor((maxLength - sepLength) / 2);
  console.log(
    chalk.blue(
      "\n" + "".padStart(spaceBefore, " ") + "".padStart(sepLength, "─") + "\n"
    )
  );
};

const boldify = (str) => {
  const parts = str.split("**");
  let isBold = true;
  if (str.indexOf("**" + parts[0]) === 0) {
    isBold = false;
  }
  return parts
    .map((part) => {
      isBold = !isBold;
      return isBold ? chalk.bold(part) : chalk.grey(part);
    })
    .join("");
};

export const log = (message, status = "regular") => {
  message = split(message);
  const maxLineLength = 85;
  // message
  //   .split("\n")
  //   .reduce((max, line) => (line.length > max ? line.length : max), 0) + 5;

  const line = "".padStart(maxLineLength, "═");

  switch (status) {
    case "success":
      console.log(chalk.green(line + "\n" + "✅   " + message + "\n" + line));
      break;
    case "error":
      console.log(chalk.red(line + "\n" + "❎   " + message + "\n" + line));
      break;
    case "warn":
      console.log(chalk.yellow(line + "\n" + " ❗  " + message + "\n" + line));
      break;
    default:
      console.log(boldify(message));
  }
};

export default {
  h1,
  h2,
  h3,
  log,
  separator,
};
