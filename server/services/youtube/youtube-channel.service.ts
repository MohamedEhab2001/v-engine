// YouTube channel service (spec §22, §23): safe channel data for the status
// endpoint. Never returns tokens.

import type { ConnectedAccountRepository } from "../../repositories/connected-account.repository.js";

export type ConnectedChannelInfo = {
  id: number;
  channelId: string;
  name: string;
  handle: string | null;
};

export const getConnectedChannel = (
  accounts: ConnectedAccountRepository,
): ConnectedChannelInfo | null => {
  const account = accounts.getYouTubeAccount();
  if (!account) {
    return null;
  }
  return {
    id: account.id,
    channelId: account.external_account_id,
    name: account.account_name,
    handle: account.channel_handle,
  };
};
