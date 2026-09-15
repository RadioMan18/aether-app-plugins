import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MoodSelector from "../src/components/MoodSelector";
import WeightEntry from "../src/components/WeightEntry";
import BloodPressureEntry from "../src/components/BloodPressureEntry";
import GlucoseEntry from "../src/components/GlucoseEntry";

describe("MoodSelector", () => {
  it("renders mood buttons", () => {
    render(<MoodSelector onSave={() => {}} />);
    expect(screen.getByText("Mood & Energy")).toBeDefined();
    expect(screen.getByText("Save Mood Entry")).toBeDefined();
  });

  it("allows selecting a mood value", () => {
    render(<MoodSelector onSave={() => {}} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(buttons[1].getAttribute("title")).toBe("Low");
  });
});

describe("WeightEntry", () => {
  it("renders unit toggle with lbs default", () => {
    render(<WeightEntry onSave={() => {}} />);
    const select = screen.getByDisplayValue("lbs");
    expect(select).toBeDefined();
  });

  it("calls onSave with valid weight", () => {
    let captured: { weight_value: number; unit: "lbs" | "kg" } | null = null;
    render(<WeightEntry onSave={(entry) => { captured = entry; }} />);
    const input = screen.getByPlaceholderText("0.0");
    fireEvent.change(input, { target: { value: "150" } });
    fireEvent.click(screen.getByText("Save Weight Entry"));
    expect(captured).toEqual({ weight_value: 150, unit: "lbs" });
  });

  it("disables save when weight is empty", () => {
    render(<WeightEntry onSave={() => {}} />);
    const button = screen.getByText("Save Weight Entry");
    expect(button.hasAttribute("disabled")).toBe(true);
  });
});

describe("BloodPressureEntry", () => {
  it("disables save when fields are empty", () => {
    render(<BloodPressureEntry onSave={() => {}} />);
    const button = screen.getByText("Save Blood Pressure Entry");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("enables save with valid values", () => {
    render(<BloodPressureEntry onSave={() => {}} />);
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "120" } });
    fireEvent.change(inputs[1], { target: { value: "80" } });
    const button = screen.getByText("Save Blood Pressure Entry");
    expect(button.hasAttribute("disabled")).toBe(false);
  });
});

describe("GlucoseEntry", () => {
  it("renders time-of-day dropdown with all options", () => {
    render(<GlucoseEntry onSave={() => {}} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    fireEvent.change(select, { target: { value: "before_breakfast" } });
    expect((select as HTMLSelectElement).value).toBe("before_breakfast");
  });

  it("disables save when glucose value is empty", () => {
    render(<GlucoseEntry onSave={() => {}} />);
    const button = screen.getByText("Save Glucose Entry");
    expect(button.hasAttribute("disabled")).toBe(true);
  });
});
