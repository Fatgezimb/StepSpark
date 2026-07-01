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

    await user.click(screen.getAllByRole("button", { name: "Progress" })[0]!);

    expect(screen.getByRole("heading", { name: "Progress" })).toBeInTheDocument();
    expect(screen.getByText(/Prototype analytics derived from deck composition/i)).toBeInTheDocument();
  });

  it("top search opens a card result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("combobox", { name: "Search cards, concepts, tags" }), "g6pd");
    const results = await screen.findByRole("region", { name: "Command search results" });
    await user.click(within(results).getByRole("button", { name: /G6PD Oxidative Stress/i }));

    expect(screen.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
  });

  it("top search navigates to a section result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("combobox", { name: "Search cards, concepts, tags" }), "import");
    const results = screen.getByRole("region", { name: "Command search results" });
    await user.click(within(results).getByRole("button", { name: /Import Deck/i }));

    expect(screen.getByRole("heading", { name: "Import from Text" })).toBeInTheDocument();
    expect(screen.getByText(/Import, merge, replace, export, or reset/i)).toBeInTheDocument();
  });

  it("dashboard calls to action navigate to the intended sections", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start Review" }));
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Today" })[0]!);
    await user.click(screen.getByRole("button", { name: "Browse Library" }));
    expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Today" })[0]!);
    await user.click(within(screen.getByRole("region", { name: "Today's StepSpark Mission" })).getByRole("button", { name: /Create Card/i }));
    expect(screen.getByRole("heading", { name: "Card Editor" })).toBeInTheDocument();
    expect(screen.getByLabelText("Task prompt")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Today" })[0]!);
    await user.click(within(screen.getByRole("region", { name: "Today's StepSpark Mission" })).getByRole("button", { name: /Import Deck/i }));
    expect(screen.getByRole("heading", { name: "Import from Text" })).toBeInTheDocument();
  });

  it("escape closes command search without triggering global card shortcuts", async () => {
    const user = userEvent.setup();
    render(<App />);

    const commandSearch = screen.getByRole("combobox", { name: "Search cards, concepts, tags" });
    await user.type(commandSearch, "g6pd");
    expect(screen.getByRole("region", { name: "Command search results" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("region", { name: "Command search results" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reed-Sternberg Recognition" })).toBeInTheDocument();
  });
});
