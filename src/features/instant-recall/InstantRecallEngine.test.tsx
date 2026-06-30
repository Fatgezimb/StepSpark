import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstantRecallEngine } from "./InstantRecallEngine";

describe("InstantRecallEngine", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it("shows an empty state instead of a stale card when filters match nothing", async () => {
    const user = userEvent.setup();
    render(<InstantRecallEngine />);

    await user.type(screen.getByLabelText("Search"), "not-a-real-card");

    expect(screen.getByText("No cards match")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Reed-Sternberg Recognition" })).not.toBeInTheDocument();
    expect(screen.getAllByText(/0 cards visible from 10 total/i).length).toBeGreaterThan(0);
  });

  it("persists edited deck data across remounts", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<InstantRecallEngine />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const titleInput = screen.getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Persistent Reed-Sternberg Pattern");
    await user.click(screen.getByRole("button", { name: "Save" }));

    unmount();
    render(<InstantRecallEngine />);

    expect(screen.getByRole("heading", { name: "Persistent Reed-Sternberg Pattern" })).toBeInTheDocument();
  });

  it("saves review state and updates bookmark and print controls", async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<InstantRecallEngine />);

    await user.click(screen.getByRole("button", { name: "Bookmark" }));
    expect(screen.getByRole("button", { name: "Bookmarked" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Print" }));
    expect(print).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Save review" }));
    expect(screen.getByText(/Review saved locally/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Fluency/i).parentElement).toHaveTextContent("67%");

    print.mockRestore();
  });

  it("labels JSON export accurately", async () => {
    const user = userEvent.setup();
    if (!URL.createObjectURL) {
      Object.defineProperty(URL, "createObjectURL", { value: vi.fn(), configurable: true });
    }

    if (!URL.revokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn(), configurable: true });
    }

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:stepspark");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<InstantRecallEngine />);

    await user.click(screen.getByRole("tab", { name: "Import" }));
    expect(screen.getByRole("button", { name: "Export JSON" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Export JSON" }));

    expect(createObjectURL).toHaveBeenCalled();
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    anchorClick.mockRestore();
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
    await user.click(screen.getAllByRole("button", { name: /G6PD Oxidative Stress/i })[0]!);

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
