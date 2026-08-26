import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurvaPill } from "@/components/curva-venda/curva-pill";

describe("CurvaPill", () => {
  it("renderiza o rótulo A", () => {
    render(<CurvaPill curva="A" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renderiza o rótulo B", () => {
    render(<CurvaPill curva="B" />);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renderiza o rótulo C", () => {
    render(<CurvaPill curva="C" />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("aplica classes visuais diferentes para cada classe", () => {
    const { container: containerA } = render(<CurvaPill curva="A" />);
    const { container: containerC } = render(<CurvaPill curva="C" />);
    const spanA = containerA.querySelector("span");
    const spanC = containerC.querySelector("span");
    expect(spanA?.className).not.toEqual(spanC?.className);
  });
});
