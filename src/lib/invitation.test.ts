import { describe, expect, it } from "vitest";
import { parseInvitationFragment } from "@/lib/invitation";

describe("admin invitation fragments", () => {
  it("extracts complete implicit-flow tokens", () => {
    expect(
      parseInvitationFragment(
        "#access_token=access-123&refresh_token=refresh-456",
      ),
    ).toEqual({
      status: "tokens",
      accessToken: "access-123",
      refreshToken: "refresh-456",
    });
  });

  it("rejects provider errors and incomplete token pairs", () => {
    expect(
      parseInvitationFragment("#error=access_denied&error_description=Expired"),
    ).toEqual({ status: "error" });
    expect(parseInvitationFragment("#access_token=access-only")).toEqual({
      status: "error",
    });
  });

  it("allows an already-established cookie session to continue", () => {
    expect(parseInvitationFragment("")).toEqual({ status: "empty" });
  });
});
