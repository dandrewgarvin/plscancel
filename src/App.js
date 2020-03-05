import React, { useState, useCallback } from "react";

import socketIOClient from "socket.io-client";

import "./App.css";

function App() {
  const socket = socketIOClient();

  const [me, setMe] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [cancelled, setCancelled] = useState(false);

  const [name, setName] = useState("");
  const [planInput, setPlanInput] = useState("");

  socket.on("created plan", newPlan => {
    console.log("CREATED PLAN");
    setPlanId(newPlan.planId);
    setPlanInfo({
      title: newPlan.title,
      description: newPlan.description
    });
    setMembers(newPlan.members);
    setMe(newPlan.members[0]);
  });

  socket.on("new member", plan => {
    console.log("MEMBER JOINED");

    setPlanInfo({
      title: plan.title,
      description: plan.description
    });
    setMembers(plan.members);
  });

  socket.on("joined plan", user => {
    console.log("ME JOINED");
    setMe(user);
  });

  socket.on("cancel requested", plan => {
    console.log("CANCEL REQUESTED");
    if (plan.cancelled) {
      setCancelled(true);
    }

    setMembers(plan.members);
  });

  const createPlan = useCallback(() => {
    console.log("CREATING");
    console.log("name", name);

    socket.emit("create plan", {
      name: name,
      title: "Game Night @ Andrews",
      description:
        "There is a small game night on Tuesday at 7:00PM. Bring Food and Games!"
    });
  }, [name, socket]);

  const joinPlan = useCallback(() => {
    console.log("JOINING");
    console.log("planInput", planInput);
    console.log("name", name);

    socket.emit("join plan", {
      planId: planInput,
      name: name
    });
  }, [name, socket, planInput]);

  const leavePlan = useCallback(() => {
    console.log("LEAVING");
    console.log("planInput", planInput);
    console.log("planId", planId);
    console.log("me.id", me.id);

    socket.emit("vote to cancel plan", {
      planId: planInput || planId,
      memberId: me.id
    });
  }, [me.id, planInput, planId, socket]);

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
