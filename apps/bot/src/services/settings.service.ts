// T-131: Bot notification settings — get/update per user

import prisma from '../prisma';
import { BotSettings, DEFAULT_SETTINGS } from './auth.service';

export async function getBotSettings(userId: string): Promise<BotSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { botSettings: true },
  });
  return (user?.botSettings as BotSettings | null) ?? { ...DEFAULT_SETTINGS };
}

export async function updateBotSettings(
  userId: string,
  updates: Partial<BotSettings>,
): Promise<BotSettings> {
  const current = await getBotSettings(userId);
  const merged: BotSettings = { ...current, ...updates };
  await prisma.user.update({
    where: { id: userId },
    data: { botSettings: merged as object },
  });
  return merged;
}
