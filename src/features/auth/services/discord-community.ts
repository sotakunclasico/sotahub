import "server-only";

const discordApi = "https://discord.com/api/v10";

interface DiscordCommunityConfig {
  botToken: string;
  guildId: string;
  memberRoleId: string;
}

function getConfig(): DiscordCommunityConfig | null {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID;
  if (!botToken || !guildId || !memberRoleId) return null;
  return { botToken, guildId, memberRoleId };
}

async function discordRequest(url: string, config: DiscordCommunityConfig, init: RequestInit) {
  const response = await fetch(`${discordApi}${url}`, {
    ...init,
    headers: {
      authorization: `Bot ${config.botToken}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Discord respondió ${response.status}: ${detail.slice(0, 300)}`);
  }
}

export async function ensureDiscordCommunityMember(userId: string, accessToken: string) {
  const config = getConfig();
  if (!config) return { configured: false as const };

  await discordRequest(`/guilds/${config.guildId}/members/${userId}`, config, {
    method: "PUT",
    body: JSON.stringify({ access_token: accessToken }),
  });

  await discordRequest(`/guilds/${config.guildId}/members/${userId}/roles/${config.memberRoleId}`, config, {
    method: "PUT",
  });

  return { configured: true as const };
}
