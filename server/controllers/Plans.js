module.exports = class Plans {
  constructor() {
    this.plans = [];
  }

  generateId() {
    const alphabet = `abcdefghjiklmnopqrstuvwxys1234567890`.split("");
    const COUNT = 10;

    let code = "";

    for (let i = 0; i < COUNT; i++) {
      code += alphabet[Math.floor(Math.random() * (alphabet.length - 1))];
    }

    return code;
  }

  createPlan({ name, title, description }) {
    const newPlan = {
      planId: this.generateId(),
      cancelled: false,
      title,
      description,
      members: [
        {
          name,
          id: this.generateId(),
          vote: null
        }
      ]
    };

    this.plans.push(newPlan);

    return newPlan;
  }

  joinPlan({ planId, name }) {
    const plan = this.plans.find(plan => plan.planId === planId);

    const newMember = {
      name,
      id: this.generateId(),
      vote: null
    };

    plan.members.push(newMember);

    return plan;
  }

  cancelPlan({ planId, memberId }) {
    console.log("planId", planId);
    console.log("memberId", memberId);

    const plan = this.plans.find(plan => plan.planId === planId);
    console.log("plan", plan);

    plan.members = plan.members.map(mem => {
      if (mem.id === memberId) {
        mem.vote = "cancel";
      }

      return mem;
    });

    // cancel plan if all members have voted for that
    const cancelled = plan.members.filter(mem => mem.vote !== "cancel");

    if (!cancelled.length) {
      plan.cancelled = true;
      this.plans = this.plans.map(plan => {
        if (plan.planId === planId) {
          plan.cancelled = true;
        }

        return plan;
      });
    }

    return plan;
  }
};
