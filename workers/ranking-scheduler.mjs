async function startRankingJob(env, mode) {
  if (!env.RANKING_ENGINE_URL || !env.RANKING_ENGINE_SECRET) {
    throw new Error("Faltan RANKING_ENGINE_URL o RANKING_ENGINE_SECRET.");
  }

  const response = await fetch(
    new URL(`/jobs/${mode}`, env.RANKING_ENGINE_URL),
    {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${env.RANKING_ENGINE_SECRET}`,
      },
    },
  );

  if (!response.ok && response.status !== 409) {
    throw new Error(`El motor de ranking respondió con ${response.status}: ${await response.text()}`);
  }
}

const scheduler = {
  async scheduled(controller, env, context) {
    const mode = controller.cron === "0 3 1 * *" ? "full" : "incremental";
    context.waitUntil(startRankingJob(env, mode));
  },
};

export default scheduler;
