import { moveCard, updateCard, type Card, type Column } from "@/lib/kanban";

describe("moveCard", () => {
  const baseColumns: Column[] = [
    { id: "col-a", title: "A", cardIds: ["card-1", "card-2"] },
    { id: "col-b", title: "B", cardIds: ["card-3"] },
  ];

  it("reorders cards in the same column", () => {
    const result = moveCard(baseColumns, "card-2", "card-1");
    expect(result[0].cardIds).toEqual(["card-2", "card-1"]);
  });

  it("moves cards to another column", () => {
    const result = moveCard(baseColumns, "card-2", "card-3");
    expect(result[0].cardIds).toEqual(["card-1"]);
    expect(result[1].cardIds).toEqual(["card-2", "card-3"]);
  });

  it("drops cards to the end of a column", () => {
    const result = moveCard(baseColumns, "card-1", "col-b");
    expect(result[0].cardIds).toEqual(["card-2"]);
    expect(result[1].cardIds).toEqual(["card-3", "card-1"]);
  });
});

describe("updateCard", () => {
  const baseCards: Record<string, Card> = {
    "card-1": { id: "card-1", title: "Original", details: "Original details" },
    "card-2": { id: "card-2", title: "Untouched", details: "Untouched details" },
  };

  it("updates the title and details of the target card", () => {
    const result = updateCard(baseCards, "card-1", {
      title: "Updated",
      details: "Updated details",
    });
    expect(result["card-1"]).toEqual({
      id: "card-1",
      title: "Updated",
      details: "Updated details",
    });
  });

  it("leaves other cards untouched", () => {
    const result = updateCard(baseCards, "card-1", { title: "Updated" });
    expect(result["card-2"]).toBe(baseCards["card-2"]);
  });
});
