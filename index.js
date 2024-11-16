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

const JWT_SECRET = process.env.JWT_SECRET;

app.post("/admin/login", async (req, res) => {
  const { user, password } = req.body;

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user", user)
    .single();

//validação
  if (error || !admin){
      return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const validaPassword = await bcrypt.compare(password, admin.password);
  if (!validaPassword){
      return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const token = jwt.sign({id: admin.id, role: 'admin'}, JWT_SECRET, {expiresIn: '1h'})
  res.json({token})
});
