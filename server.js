const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
async function getConnection() {
  return await oracledb.getConnection({
    user: "system",
    password: "hladhi",
    connectString: "localhost/XE"
  });
}
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Mini CRM Server is Running!");
});
let leads = [];

app.post("/add-lead", async (req, res) => {

  const { name, email, status } = req.body;

  try {

    const connection = await getConnection();

    await connection.execute(
      `INSERT INTO leads (name, email, status) VALUES (:name, :email, :status)`,
      { name, email, status },
      { autoCommit: true }
    );

    await connection.close();

    res.json({ message: "Lead added successfully" });

  } catch (err) {
    console.error(err);
    res.json({ message: "Database error" });
  }

});
app.get("/leads", async (req, res) => {

  try {

    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT id, name, email, status FROM leads`
    );

    await connection.close();

    const leads = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      email: row[2],
      status: row[3]
    }));

    res.json(leads);

  } catch (err) {
    console.error(err);
    res.json({ message: "Database error" });
  }

});
app.put("/update-status/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const lead = leads.find(l => l.id === id);

  if (!lead) {
    return res.json({ message: "Lead not found" });
  }

  lead.status = status;

  res.json({
    message: "Lead status updated",
    lead
  });
});
app.put("/add-note/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { note } = req.body;

  const lead = leads.find(l => l.id === id);

  if (!lead) {
    return res.json({ message: "Lead not found" });
  }

  lead.note = note;

  res.json({
    message: "Note added successfully",
    lead
  });
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
