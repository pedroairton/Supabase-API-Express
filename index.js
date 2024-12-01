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
const cors = require("cors");
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
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
// rota de teste
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello World" });
});
// registrar usuário comum
app.post('/user/register', async (req, res) => {
  const { email, password, apartamento, bloco } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password: hashedPassword, apartamento, bloco }]);

  if (error) return res.status(500).json({ message: 'Erro ao registrar usuário.', error });

  res.status(201).json({ message: 'Administrador registrado com sucesso!' });
});
//endpoint rota login usuário comum
app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  //validação
  if (error || !user) {
    return res
      .status(401)
      .json({ message: "Credenciais inválidas: Usuário não existe" });
  }

  const validaPassword = await bcrypt.compare(password, user.password);
  if (!validaPassword) {
    return res
      .status(401)
      .json({ message: "Credenciais inválidas: Senha incorreta" });
  } else {
    console.log("Login validado");
    const userapt = user.apartamento
    const userbloco = user.bloco
    const status = user.status
    const token = jwt.sign({ id: user.id, role: "admin" }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, userapt, userbloco, status});
  }
});
// receber todos os usuários comuns (não precisa estar autenticado.)
app.get("/users", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
// ativar usuário
app.put("/user/update/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Erro ao conectar ao banco", error);
  } else {
    res.status(200).json(data);
  }
  // console.log(data)
});
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
    return res
      .status(500)
      .json({ message: "Erro cadastrando mensagem!", data });
  } else {
    return res
      .status(201)
      .json({ message: "Mensagem cadastrada com sucesso.", data });
  }
});
//endpoint rota cadastro conversa se estiver autenticado
app.post("/conversa", async (req, res) => {
  const { mensagem, autor } = req.body;

  const { data, error } = await supabase
    .from("conversas")
    .insert([{ mensagem, autor }]);

  if (error) {
    return res
      .status(500)
      .json({ message: "Erro cadastrando mensagem!", data });
  } else {
    return res
      .status(201)
      .json({ message: "Mensagem cadastrada com sucesso.", data });
  }
});
// receber todas as conversas (não precisa estar autenticado.)
app.get("/conversas", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase
    .from("conversas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
app.post("/admin/encomenda", authMiddleware, async (req, res) => {
  const {
    apt_vinculado,
    bloco_apartamento,
    transportadora,
    descricao,
    status,
  } = req.body;

  const { data, error } = await supabase
    .from("encomendas")
    .insert([
      { apt_vinculado, bloco_apartamento, transportadora, descricao, status },
    ]);

  if (error) {
    return res
      .status(500)
      .json({ message: "Erro cadastrando encomenda!", data });
  } else {
    return res
      .status(201)
      .json({ message: "Encomenda cadastrada com sucesso.", data });
  }
});
//endpoint rota cadastro reserva (sem autenticação)
app.post("/admin/reserva", async (req, res) => {
  const { local_reservado, horario_inicial, horario_final, apt_responsavel, bloco_apt } = req.body;

  // Verificação de conflito de horários
  const { data: reservasExistentes, error: errorConsulta } = await supabase
    .from("reservas")
    .select("*")
    .eq("local_reservado", local_reservado)
    .or(`horario_inicial.lte.${horario_final},horario_final.gte.${horario_inicial}`);

  if (errorConsulta) {
    return res.status(500).json({ message: "Erro ao verificar conflitos!", error: errorConsulta });
  }

  // Filtrar reservas conflitantes que realmente se sobrepõem
  const conflito = reservasExistentes.some((reserva) => {
    return (
      (new Date(reserva.horario_inicial) < new Date(horario_final)) &&
      (new Date(reserva.horario_final) > new Date(horario_inicial))
    );
  });

  if (conflito) {
    return res.status(400).json({ message: "Conflito de horários! Já existe uma reserva neste período." });
  }

  // Inserção da nova reserva se não houver conflitos
  const { data, error } = await supabase
    .from("reservas")
    .insert([{ local_reservado, horario_inicial, horario_final, apt_responsavel, bloco_apt }]);

  if (error) {
    return res.status(500).json({ message: "Erro cadastrando reserva!", error });
  } else {
    return res.status(201).json({ message: "Reserva cadastrada com sucesso.", data });
  }
});
// receber reservas por filtro de data
app.get("/reservas/:data", async (req, res) => {
  const dataSelecionada = req.params.data; // Formato esperado: 'YYYY-MM-DD'

  const { data, error } = await supabase
    .from("reservas")
    .select("*")
    .gte("horario_inicial", `${dataSelecionada}T00:00:00`)
    .lt("horario_inicial", `${dataSelecionada}T23:59:59`);

  if (error) {
    return res.status(500).json({ message: "Erro ao buscar reservas!", error });
  } else {
    return res.status(200).json(data);
  }
});
// deletar reserva
app.delete("/admin/reserva/del/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("reservas")
    .delete()
    .eq("id", id)
    .select();
  if (error) {
    console.error("Erro ao deletar: ", error);
  } else {
    res.status(200).json(data);
  }
});
// receber todos os moradores (não precisa estar autenticado.)
app.get("/moradores", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase
    .from("apartamentos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
// atualizar morador
app.put("/admin/update/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { responsavel, apartamento, email, tipo_residente, bloco } = req.body;

  if (!responsavel || !apartamento || !email || !tipo_residente || !bloco) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const { data, error } = await supabase
    .from("apartamentos")
    .update({ responsavel, apartamento, email, tipo_residente, bloco })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Erro ao conectar ao banco", error);
  } else {
    res.status(200).json(data);
  }
  // console.log(data)
});
// deletar morador
app.delete("/admin/del/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("apartamentos")
    .delete()
    .eq("id", id)
    .select();
  if (error) {
    console.error("Erro ao deletar: ", error);
  } else {
    res.status(200).json(data);
  }
});
// receber todas as mensagens (não precisa estar autenticado.)
app.get("/mensagens", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase
    .from("mensagens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
// deletar mensagem
app.delete("/admin/mensagem/del/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("mensagens")
    .delete()
    .eq("id", id)
    .select();
  if (error) {
    console.error("Erro ao deletar: ", error);
  } else {
    res.status(200).json(data);
  }
});
// receber todas as reservas (não precisa estar autenticado.)
app.get("/reservas", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase
    .from("reservas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
// receber todas os encomendas (precisa estar autenticado.)
app.get("/admin/encomendas", authMiddleware, async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const { data, error } = await supabase
    .from("encomendas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data;
  }
});
// atualizar encomenda
app.put("/admin/encomenda/update/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { apt_vinculado, bloco_apartamento, transportadora, descricao, status } = req.body;

  if (!apt_vinculado || !bloco_apartamento || !transportadora || !status ) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const { data, error } = await supabase
    .from("encomendas")
    .update({ apt_vinculado, bloco_apartamento, transportadora, descricao, status })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Erro ao conectar ao banco", error);
  } else {
    res.status(200).json(data);
  }
  // console.log(data)
});
// deletar encomenda
app.delete("/admin/encomenda/del/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("encomendas")
    .delete()
    .eq("id", id)
    .select();
  if (error) {
    console.error("Erro ao deletar: ", error);
  } else {
    res.status(200).json(data);
  }
});

const port = 8080;

app.listen(port, () => {
  console.log("Rodando com Express na Porta: " + port);
});

module.exports = app;
