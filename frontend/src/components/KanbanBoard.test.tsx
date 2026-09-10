import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/components/KanbanBoard";

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

const renderBoard = (onLogout: () => void = () => {}) =>
  render(<KanbanBoard username="user" onLogout={onLogout} />);

describe("KanbanBoard", () => {
  it("renders five columns", () => {
    renderBoard();
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("renames a column", async () => {
    renderBoard();
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");
  });

  it("logs out", async () => {
    const onLogout = vi.fn();
    renderBoard(onLogout);
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("adds and removes a card", async () => {
    renderBoard();
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    expect(within(column).getByText("New card")).toBeInTheDocument();

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByText("New card")).not.toBeInTheDocument();
  });

  it("edits a card's title and details", async () => {
    renderBoard();
    const column = getFirstColumn();

    const editButton = within(column).getByRole("button", {
      name: /edit align roadmap themes/i,
    });
    await userEvent.click(editButton);

    const card = within(column).getByTestId("card-card-1");

    const titleInput = within(card).getByLabelText("Card title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Renamed card");

    const detailsInput = within(card).getByLabelText("Card details");
    await userEvent.clear(detailsInput);
    await userEvent.type(detailsInput, "New details");

    await userEvent.click(within(card).getByRole("button", { name: /save/i }));

    expect(within(column).getByText("Renamed card")).toBeInTheDocument();
    expect(within(column).getByText("New details")).toBeInTheDocument();
  });
});
