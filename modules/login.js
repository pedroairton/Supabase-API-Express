


const users = require("./users");

app.post("/login", async (req, res) => {
  const { user, password } = req.body
  let { data, error } = await supabase
  .auth.signUp({
    user: user,
    password: password,
  })
  .from('admins')
  if(error){
    console.error('Erro: ', error)
  } else {
    res.status(200).json(data)
  }
});
