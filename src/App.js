import React, { useState, useCallback } from "react";

import socketIOClient from "socket.io-client";

import "./App.css";

function App() {
  const socket = socketIOClient();

  console.log("socket", socket);

  const [me, setMe] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [cancelled, setCancelled] = useState(false);

  const [name, setName] = useState("");
  const [planInput, setPlanInput] = useState("");

  socket.on("created plan", newPlan => {
    setPlanId(newPlan.planId);
    setPlanInfo({
      title: newPlan.title,
      description: newPlan.description
    });
    setMembers(newPlan.members);
    setMe(newPlan.members[0]);
  });

  socket.on("new member", plan => {
    setPlanInfo({
      title: plan.title,
      description: plan.description
    });
    setMembers(plan.members);
  });

  socket.on("joined plan", user => {
    setMe(user);
  });

  socket.on("cancel requested", plan => {
    if (plan.cancelled) {
      setCancelled(true);
    }

    setMembers(plan.members);
  });

  const createPlan = useCallback(() => {
    socket.emit("create plan", {
      name: name,
      title: "Game Night @ Andrews",
      description:
        "There is a small game night on Tuesday at 7:00PM. Bring Food and Games!"
    });
  }, []);

  const joinPlan = useCallback(() => {
    socket.emit("join plan", {
      planId: planInput,
      name: name
    });
  }, []);

  const leavePlan = useCallback(() => {
    socket.emit("vote to cancel plan", {
      planId: planInput || planId,
      memberId: me.id
    });
  }, []);

  return (
    <div className="App">
      <h1>PLS CANCEL</h1>
      <input
        value={name}
        onChange={evnt => setName(evnt.target.value)}
        placeholder="Name"
      />
      <input
        value={planInput}
        onChange={evnt => setPlanInput(evnt.target.value)}
        placeholder="Plan ID"
      />

      <button onClick={createPlan}>Create Plan</button>
      <button onClick={joinPlan}>Join Plan</button>
      <button onClick={leavePlan}>Leave Plan</button>

      {planId ? (
        <p>
          Your plan ID is: <strong>{planId}</strong>
        </p>
      ) : (
        ""
      )}

      {planInfo ? (
        <div>
          <h4>{planInfo.title}</h4>
          <p>{planInfo.description}</p>
        </div>
      ) : (
        ""
      )}

      {members.map((mem, ind) => (
        <p key={ind} style={{ color: mem.vote === "cancel" ? "red" : "black" }}>
          {mem.name}
        </p>
      ))}

      {cancelled ? (
        <h1>YOUR PLANS HAVE BEEN CANCELLED! ENJOY YOUR EVENING</h1>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
