const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const socket = require("socket.io");

const PlanController = require("./controllers/Plans");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(__dirname + "/../build"));

const port = process.env.PORT;
const io = socket(
  app.listen(port, () => console.log(`listening on port ${port}`))
);

const Plans = new PlanController();

io.on("connection", socket => {
  console.log(
    `Socket ${socket.id} has connected from address ${socket.handshake.address}.`
  );

  socket.on("create plan", async input => {
    const newPlan = Plans.createPlan(input);

    socket.join(newPlan.planId);
    socket.emit("created plan", newPlan);
  });

  socket.on("join plan", async input => {
    const plan = Plans.joinPlan(input);

    socket.join(plan.planId);
    socket.emit("joined plan", plan.members[plan.members.length - 1]);
    io.to(input.planId).emit("new member", plan);
  });

  socket.on("vote to cancel plan", async input => {
    const plan = Plans.cancelPlan(input);

    io.to(input.planId).emit("cancel requested", plan);
  });
});
