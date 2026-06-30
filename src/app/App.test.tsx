import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("changes visible content when navigation changes section", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Analytics" })[0]!);

    expect(screen.getByRole("heading", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByText(/Prototype analytics derived from deck composition/i)).toBeInTheDocument();
  });

  it("top search opens a card result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("combobox", { name: "Search cards, concepts, tags" }), "g6pd");
    const results = await screen.findByRole("region", { name: "Command search results" });
    await user.click(within(results).getByRole("button", { name: /G6PD Oxidative Stress/i }));

    expect(screen.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("top search navigates to a section result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("combobox", { name: "Search cards, concepts, tags" }), "import");
    const results = screen.getByRole("region", { name: "Command search results" });
    await user.click(within(results).getByRole("button", { name: /Import from Text/i }));

    expect(screen.getByRole("heading", { name: "Import from Text" })).toBeInTheDocument();
    expect(screen.getByText(/Import, merge, replace, export, or reset/i)).toBeInTheDocument();
  });
});
