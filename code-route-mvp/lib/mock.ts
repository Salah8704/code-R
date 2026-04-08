export function getDashboardMock() {
  return {
    currentBlock: { seriesCompleted: 1 },
    pause: { active: false, resumeAt: "14:30" },
    globalScore: 74,
    readinessLabel: "Presque prêt",
    lastExam: 31,
    topTraps: [
      { name: "Priorité implicite", score: 14 },
      { name: "Feu éteint", score: 11 },
      { name: "Panneau ignoré", score: 9 }
    ],
    nextAction: "Fais une deuxième série pour terminer ton bloc."
  };
}
