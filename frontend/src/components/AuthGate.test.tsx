import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthGate } from "@/components/AuthGate";
import * as auth from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

describe("AuthGate", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows the login form when there is no session", async () => {
    vi.mocked(auth.fetchCurrentUser).mockResolvedValue(null);

    render(<AuthGate />);

    expect(
      await screen.findByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("shows the board when a session already exists", async () => {
    vi.mocked(auth.fetchCurrentUser).mockResolvedValue({ username: "user" });

    render(<AuthGate />);

    expect(
      await screen.findByRole("heading", { name: "Kanban Studio" })
    ).toBeInTheDocument();
  });

  it("shows an error message when login fails", async () => {
    vi.mocked(auth.fetchCurrentUser).mockResolvedValue(null);
    vi.mocked(auth.login).mockRejectedValue(
      new Error("Invalid username or password.")
    );

    render(<AuthGate />);
    await screen.findByRole("heading", { name: /sign in/i });

    await userEvent.type(screen.getByLabelText("Username"), "user");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid username or password/i)
    ).toBeInTheDocument();
  });

  it("logs in and then logs out", async () => {
    vi.mocked(auth.fetchCurrentUser).mockResolvedValue(null);
    vi.mocked(auth.login).mockResolvedValue({ username: "user" });
    vi.mocked(auth.logout).mockResolvedValue(undefined);

    render(<AuthGate />);
    await screen.findByRole("heading", { name: /sign in/i });

    await userEvent.type(screen.getByLabelText("Username"), "user");
    await userEvent.type(screen.getByLabelText("Password"), "password");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByRole("heading", { name: "Kanban Studio" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(
      await screen.findByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
  });
});
