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
const cors = require('cors')

const app = express();
app.use(cors())
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
    return res
      .status(401)
      .json({ message: "Credenciais inválidas: Usuário não existe" });
  }

  const validaPassword = await bcrypt.compare(password, admin.password);
  if (!validaPassword) {
    return res
      .status(401)
      .json({ message: "Credenciais inválidas: Senha incorreta" });
  } else {
    console.log("Login validado");
    const token = jwt.sign({ id: admin.id, role: "admin" }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  }
});
//endpoint rota cadastro moradores se estiver autenticado
app.post("/admin/cadastro", authMiddleware, async (req, res) => {
  const { responsavel, apartamento, email, tipo_residente, bloco } = req.body;

  const { data, error } = await supabase
    .from("apartamentos")
    .insert([{ responsavel, apartamento, email, tipo_residente, bloco }]);

  if (error) {
    return res.status(500).json({ message: "Erro cadastrando usuário!", data });
  } else {
    return res
      .status(201)
      .json({ message: "Usuário cadastrado com sucesso.", data });
  }
});
//endpoint rota cadastro mensagem se estiver autenticado
app.post("/admin/mensagem", authMiddleware, async (req, res) => {
  const { mensagem } = req.body;

  const { data, error } = await supabase
    .from("mensagens")
    .insert([{ mensagem }]);

  if (error) {
    return res.status(500).json({ message: "Erro cadastrando mensagem!", data });
  } else {
    return res
      .status(201)
      .json({ message: "Mensagem cadastrada com sucesso.", data });
  }
});
app.post("/admin/encomenda", authMiddleware, async (req, res) => {
  const { apt_vinculado, bloco_apartamento, transportadora, descricao, status } = req.body;

  const { data, error } = await supabase
    .from("encomendas")
    .insert([{ apt_vinculado, bloco_apartamento, transportadora, descricao, status }]);

  if (error) {
    return res.status(500).json({ message: "Erro cadastrando encomenda!", data });
  } else {
    return res
      .status(201)
      .json({ message: "Encomenda cadastrada com sucesso.", data });
  }
});

// receber todos os moradores (não precisa estar autenticado.)
app.get("/moradores", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase.from("apartamentos").select("*").order('created_at', {ascending: false}).limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
// receber todas as mensagens (não precisa estar autenticado.)
app.get("/mensagens", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase.from("mensagens").select("*").order('created_at', {ascending: false}).limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
// receber todas os encomendas (precisa estar autenticado.)
app.get("/admin/encomendas", authMiddleware ,async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase.from("encomendas").select("*").order('created_at', {ascending: false}).limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});

const port = 8080;

app.listen(port, () => {
  console.log("Rodando com Express na Porta: " + port);
});
