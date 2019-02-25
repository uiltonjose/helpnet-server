const request = require("supertest");
const app = require("./app");

describe("Root Request", () => {
  it("should call root API with Server Alive!", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toBe("HelpNet - Webservice alive! Ready to work.");
  });
});

describe("OS", () => {
  it("should check if user can open OS", async () => {
    const response = await request(app).get(
      "/api/os/canOpen?providerId=1&customerId=1"
    );
    expect(response.status).toBe(200);
    // expect(response.body).toBe({
    //   code: 200,
    //   data: {
    //     canOpen: "true"
    //   }
    // });
  });

  it("API CanOpen - should return bad request if is missing providerId", async () => {
    const response = await request(app).get("/api/os/canOpen?customerId=1");
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
    // expect(response.body).toBe({
    //   code: 200,
    //   data: {
    //     canOpen: "true"
    //   }
    // });
  });
});
