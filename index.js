const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_PASSWORD;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const authMiddleware = require("./middleware/auth");

const express = require("express");
const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// app.post('/admin/register', async (req, res) => {
//   const { user, password } = req.body;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const { data, error } = await supabase
//     .from('admins')
//     .insert([{ user, password: hashedPassword }]);

//   if (error) return res.status(500).json({ message: 'Erro ao registrar administrador.', error });

//   res.status(201).json({ message: 'Administrador registrado com sucesso!' });
// });

//endpoint rota login administradores
app.post("/admin/login", async (req, res) => {
  const { user, password } = req.body;

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user", user)
    .single();

  //validação
  if (error || !admin) {
    return res.status(401).json({ message: "Credenciais inválidas: Usuário não existe" });
  }

  const validaPassword = await bcrypt.compare(password, admin.password);
  if (!validaPassword) {
    return res.status(401).json({ message: "Credenciais inválidas: Senha incorreta" })
  } else {
    console.log('Login validado')
    const token = jwt.sign({ id: admin.id, role: "admin" }, JWT_SECRET, {
      expiresIn: "6h",
    });
    res.json({ token })
  }
});
//endpoint rota cadastro usuários se estiver autenticado
app.post("/admin/cadastro", authMiddleware, async (req, res) => {
  const { responsavel, apartamento, email, tipo_residente, bloco } = req.body

  const { data, error } = await supabase
    .from("apartamentos")
    .insert([{ responsavel, apartamento, email, tipo_residente, bloco }])

  if (error) {
    return res.status(500).json({ message: "Erro cadastrando usuário!", data })
  } else {
    return res
      .status(201)
      .json({ message: "Usuário cadastrado com sucesso.", data })
  }
});

const port = 8080

app.listen(port, () => {
  console.log("Rodando com Express na Porta: " + port);
});
