const express = require("express");

const app = express();
app.use(express.json()) //EXPRESS CONFIGURADO PARA LER COMO JSON

const {createClient} = require('@supabase/supabase-js')
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_PASSWORD
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// app.get("/home", (req, res) => {
//   res.contentType("application/json");
//   res.status(200).send("<h1> Teste de funcionamento; Express</h1>");
// });

app.get("/users", async (req, res) => {

  const { data, error } = await supabase.from("apartamentos").select("*");

  if (error) {
    console.error("Erro ao conectar:", error);
  } else {
    res.status(200).json(data);
    return data
  }
});

app.post('/users', async (req, res) => {
  const { responsavel, apartamento, email, tipo_residente, bloco } = req.body

  const { data, error } = await supabase
  .from('apartamentos')
  .insert([{ responsavel, apartamento, email, tipo_residente, bloco },])
  .select()

  if (error) {
    console.log('Erro ao realizar o post: ', error)
  }
  else{
    res.status(201).json(data);
    res.send('POST Realizado!')
    return req.body
  }
  console.log(req.body)
})

app.put('/users/:id', async (req, res) => {
  const { id } = req.params
  const { responsavel, apartamento, tipo_residente, bloco } = req.body

  if (!responsavel || !apartamento || !email || !tipo_residente || !bloco) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const { data, error } = await supabase
    .from('apartamentos')
    .update({ responsavel, apartamento, tipo_residente, bloco })
    .eq('id', id)
    .select()

  if(error) {
    console.error('Erro ao conectar ao banco', error)
  } else {
    res.status(200).json(data)
  }
  // console.log(data)
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
  .from('apartamentos')
  .delete()
  .eq('id', id)
  .select()
  if (error) {
    console.error('Erro ao deletar: ', error)
  } else {
    res.status(200).json(data)
  }
});

