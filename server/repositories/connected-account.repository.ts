// Connected account persistence (spec §33). SQL stays out of route
// handlers. Refresh tokens are never overwritten with null/undefined
// (spec §32).

import type { PublishingDatabase } from "../db/database.js";

export type ConnectedAccountRow = {
  id: number;
  platform: string;
  external_account_id: string;
  account_name: string;
  channel_handle: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expiry: number | null;
  scope: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertYouTubeAccountData = {
  externalAccountId: string;
  accountName: string;
  channelHandle: string | null;
  accessToken: string | null;
  /** null = keep the existing stored refresh token (spec §32). */
  refreshToken: string | null;
  tokenExpiry: number | null;
  scope: string | null;
};

export const createConnectedAccountRepository = (
  database: PublishingDatabase,
) => {
  const getYouTubeAccount = (): ConnectedAccountRow | undefined =>
    database
      .prepare(
        "SELECT * FROM connected_accounts WHERE platform = 'youtube' LIMIT 1",
      )
      .get() as ConnectedAccountRow | undefined;

  const upsertYouTubeAccount = (data: UpsertYouTubeAccountData): void => {
    const now = new Date().toISOString();
    const existing = getYouTubeAccount();

    if (existing) {
      database
        .prepare(
          `UPDATE connected_accounts SET
             external_account_id = ?,
             account_name = ?,
             channel_handle = ?,
             access_token = ?,
             refresh_token = COALESCE(?, refresh_token),
             token_expiry = ?,
             scope = ?,
             updated_at = ?
           WHERE id = ?`,
        )
        .run(
          data.externalAccountId,
          data.accountName,
          data.channelHandle,
          data.accessToken,
          data.refreshToken,
          data.tokenExpiry,
          data.scope,
          now,
          existing.id,
        );
      return;
    }

    database
      .prepare(
        `INSERT INTO connected_accounts
           (platform, external_account_id, account_name, channel_handle,
            access_token, refresh_token, token_expiry, scope,
            created_at, updated_at)
         VALUES ('youtube', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        data.externalAccountId,
        data.accountName,
        data.channelHandle,
        data.accessToken,
        data.refreshToken,
        data.tokenExpiry,
        data.scope,
        now,
        now,
      );
  };

  const deleteYouTubeAccount = (): void => {
    database
      .prepare("DELETE FROM connected_accounts WHERE platform = 'youtube'")
      .run();
  };

  return { getYouTubeAccount, upsertYouTubeAccount, deleteYouTubeAccount };
};

export type ConnectedAccountRepository = ReturnType<
  typeof createConnectedAccountRepository
>;
