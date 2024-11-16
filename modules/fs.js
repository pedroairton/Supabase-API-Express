const { error } = require("console");
const fs = require("fs");
const path = require("path");

// criar uma pasta

// fs.mkdir(path.join(__dirname, "/test"), (error) => {
//   if (error) {
//     return console.log("Erro", error);
//   } else {
//     console.log("pasta criada!");
//   }
// });

// criar um arquivo

fs.writeFile(
  path.join(__dirname, "/test", "test.txt"),
  "Hello node",
  (error) => {
    if (error) {
      return console.log("Erro: ", error);
    } else {
      console.log("arquivo criado!");
    }
    // adicionar à um arquivo

    fs.appendFile(
      path.join(__dirname, "/test", "/test.txt"),
      "Hello world \n",
      (error) => {
        if (error) {
          return console.log("Erro: ", error);
        } else {
          console.log("arquivo modificado!");
        }
      }
    );

    //  ler arquivo

    fs.readFile(
      path.join(__dirname, "/test", "test.txt"),
      "utf8",
      (error, data) => {
        if (error) {
          console.log("Erro: ", error);
        } else {
          console.log(data);
        }
      }
    );
  }
);
