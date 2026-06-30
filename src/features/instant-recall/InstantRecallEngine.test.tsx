import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InstantRecallEngine } from "./InstantRecallEngine";

describe("InstantRecallEngine", () => {
  it("reveals and hides the selected card answer", async () => {
    const user = userEvent.setup();
    render(<InstantRecallEngine />);

    expect(screen.queryByText(/Hodgkin lymphoma with Reed-Sternberg cells/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reveal/i }));
    expect(screen.getAllByText(/Hodgkin lymphoma with Reed-Sternberg cells/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /hide/i }));
    expect(screen.queryByText(/Hodgkin lymphoma with Reed-Sternberg cells/i)).not.toBeInTheDocument();
  });

  it("searches cards and selects the first filtered result", async () => {
    const user = userEvent.setup();
    render(<InstantRecallEngine />);

    await user.type(screen.getByLabelText("Search"), "g6pd");

    expect(await screen.findByRole("heading", { name: "G6PD Oxidative Stress" })).toBeInTheDocument();
    expect(screen.getByText(/1 cards visible from 10 total/i)).toBeInTheDocument();
  });

  it("edits and saves the selected card through the workbench", async () => {
    const user = userEvent.setup();
    render(<InstantRecallEngine />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Reed-Sternberg Pattern");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { name: "Reed-Sternberg Pattern" })).toBeInTheDocument();
  });

  it("blocks card changes while edits are unsaved", async () => {
    const user = userEvent.setup();
    render(<InstantRecallEngine />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const titleInput = screen.getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Unsaved title");
    await user.click(screen.getByRole("button", { name: /G6PD Oxidative Stress/i }));

    expect(screen.getByText(/Save or cancel the current edits before changing cards/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reed-Sternberg Recognition" })).toBeInTheDocument();
  });

  it("requires visible confirmation before deleting a card", async () => {
    const user = userEvent.setup();
    render(<InstantRecallEngine />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const confirmation = screen.getByText(/Delete this card from the local deck/i).parentElement;

    expect(confirmation).toBeInTheDocument();
    expect(within(confirmation!).getByRole("button", { name: /Confirm delete/i })).toBeInTheDocument();

    await user.click(within(confirmation!).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText(/Delete this card from the local deck/i)).not.toBeInTheDocument();
  });

  it("requires a reviewer before saving a reviewed card", async () => {
    const user = userEvent.setup();
    render(<InstantRecallEngine />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const statusComboboxes = screen.getAllByRole("combobox", { name: "Status" });
    expect(statusComboboxes).toHaveLength(2);
    await user.click(statusComboboxes[1]!);
    await user.click(screen.getByRole("option", { name: "Reviewed" }));

    expect(screen.getByText(/Reviewed cards require a named medical reviewer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(screen.getByLabelText("Reviewer"), "Medical Reviewer");
    expect(screen.queryByText(/Reviewed cards require a named medical reviewer/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Reviewer: Medical Reviewer")).toBeInTheDocument();
  });
});
