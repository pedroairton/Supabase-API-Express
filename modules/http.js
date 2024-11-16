const http = require("http");

const port = 8080;

const server = http.createServer((req, res) => {
  if (req.url === "/home") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Home page</h1>");
  }

  if (req.url === "/users") {
    const users = [
      {
        name: "Pedro",
        age: 23,
        country: 'Brazil'
      },
      {
        name: "Pablo",
        age: 22,
        country: 'Uruguay'
      },
      {
        name: 'Peter',
        age: 24,
        country: 'United States'
      },
      {
        name: 'Pietro',
        age: 13,
        country: 'Nicaragua'
      },
      {
        name: 'Piotr',
        age: 38,
        country: 'Poland'
      }
    ];
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(users))
  }
});

server.listen(port, () => console.log("Server rodando na porta " + port));

