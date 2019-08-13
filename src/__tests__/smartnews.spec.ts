import { sampleFeed } from "./setup";

describe("smartnews", () => {
  it("should generate a valid feed", () => {
    const actual = sampleFeed.smartnews();
    expect(actual).toMatchSnapshot();
  });
});
