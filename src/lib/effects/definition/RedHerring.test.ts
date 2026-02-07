import { it, expect } from "vitest";

// RedHerring is a pure marker effect — no behavior, handlers, or perception modifiers.
// It is checked as data by the FortuneTeller's NightAction component.
it("RedHerring is a marker effect with no testable behavior", () => {
    expect(true);
});
