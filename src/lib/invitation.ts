export type InvitationFragment =
  | { status: "tokens"; accessToken: string; refreshToken: string }
  | { status: "error" }
  | { status: "empty" };

export function parseInvitationFragment(hash: string): InvitationFragment {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.has("error") || params.has("error_description"))
    return { status: "error" };

  const accessToken = params.get("access_token") ?? "";
  const refreshToken = params.get("refresh_token") ?? "";
  if (!accessToken && !refreshToken) return { status: "empty" };
  if (
    !accessToken ||
    !refreshToken ||
    accessToken.length > 8192 ||
    refreshToken.length > 8192
  )
    return { status: "error" };

  return { status: "tokens", accessToken, refreshToken };
}
