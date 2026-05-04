import { GUEST_TAGS, type GuestTag } from "./eventGuest.model.js";

/**
 * Canonical guestTag values (same as GET guest events / event guests): single, 2_person, family.
 * Accepts optional human-friendly aliases: "two", "2 person" → 2_person.
 */
export const normalizeGuestTagInput = (tag: string): GuestTag => {
  const normalized = tag.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "two") {
    return "2_person";
  }
  if ((GUEST_TAGS as readonly string[]).includes(normalized)) {
    return normalized as GuestTag;
  }
  throw new Error("guestTag must be one of: single, 2_person, family");
};
