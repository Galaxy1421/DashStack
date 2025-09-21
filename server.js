const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;
const DATA_FILE = __dirname + '/team.json';

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// 🟢 Get all members
app.get('/api/team', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });
    res.json(JSON.parse(data));
  });
});

// 🟢 Get member by ID
app.get('/api/team/:id', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });

    let members = JSON.parse(data);
    const member = members.find(m => m.id === parseInt(req.params.id));
    if (!member) return res.status(404).json({ error: 'Member not found' });

    res.json(member);
  });
});

// 🟡 Add member
app.post('/api/team', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });

    let members = JSON.parse(data);
    const lastId = members.length > 0 ? Math.max(...members.map(m => m.id)) : 0;
    const newMember = { id: lastId + 1, ...req.body };

    members.push(newMember);

    fs.writeFile(DATA_FILE, JSON.stringify(members, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save data' });
      res.json(newMember);
    });
  });
});

// 🟡 Update member
app.put('/api/team/:id', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });

    let members = JSON.parse(data);
    const index = members.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Member not found' });

    members[index] = { ...members[index], ...req.body };

    fs.writeFile(DATA_FILE, JSON.stringify(members, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update data' });
      res.json(members[index]);
    });
  });
});

// 🔴 Delete member
app.delete('/api/team/:id', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });

    let members = JSON.parse(data);
    members = members.filter(m => m.id !== parseInt(req.params.id));

    fs.writeFile(DATA_FILE, JSON.stringify(members, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save data' });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
