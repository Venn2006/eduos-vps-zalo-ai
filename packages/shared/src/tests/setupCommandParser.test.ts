import { parseSetupCommand } from "../parsers/setupCommandParser";

describe("Setup Command Parser", () => {
  it("parses basic classCode", () => {
    const res = parseSetupCommand("/setup HSK1-A06");
    expect(res).toEqual({
      commandType: "SETUP",
      classCode: "HSK1-A06"
    });
  });

  it("parses classCode as key-value", () => {
    const res = parseSetupCommand("/setup classCode=HSK1-A06");
    expect(res).toEqual({
      commandType: "SETUP",
      classCode: "HSK1-A06"
    });
  });

  it("parses classCode with clone", () => {
    const res = parseSetupCommand("/setup HSK1-A06 clone=HSK1-A05");
    expect(res).toEqual({
      commandType: "SETUP",
      classCode: "HSK1-A06",
      cloneFromClassCode: "HSK1-A05"
    });
  });

  it("parses complex command with quotes", () => {
    const res = parseSetupCommand('/setup class="HSK1 Tối 2-4-6" course="Tiếng Trung HSK Starter" teacher="Cô Linh" schedule="T2,T4,T6 18:30-20:00" start="10/06/2026" template="hsk"');
    expect(res).toEqual({
      commandType: "SETUP",
      className: "HSK1 Tối 2-4-6",
      courseName: "Tiếng Trung HSK Starter",
      teacherName: "Cô Linh",
      scheduleText: "T2,T4,T6 18:30-20:00",
      startDate: "10/06/2026",
      templateName: "hsk"
    });
  });

  it("returns null for non-setup command", () => {
    expect(parseSetupCommand("Hello")).toBeNull();
    expect(parseSetupCommand("/start")).toBeNull();
  });

  it("returns null if no classCode or class provided", () => {
    expect(parseSetupCommand("/setup course=Test")).toBeNull();
  });
});
