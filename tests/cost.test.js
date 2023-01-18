const supertest = require("supertest");
const assert = require("assert");
const { app, server } = require("../grocery");
const api = supertest(app);
const { credentials, contentType } = require("./helper");
const auth = {};
const product = {
  name: "Nutrileche",
  description: "Leche liquida",
  stock: 50,
  proces: 25.6,
  expiration_date: "2022-10-28 23:40:20",
  barcode: "1234567890",
};
//login to get auth token
beforeEach(async () => {
  await api
    .post("/api/v1/login")
    .send(credentials)
    .expect(200)
    .expect("Content-Type", contentType)
    .then((response) => {
      auth.token = response.body.data.token;
      //   assert(response.body.data.mensaje, "Correct authentication");
    });
});

test("Create Product", async () => {
  await api
    .post("/api/v1/products")
    .set("Authorization", auth.token)
    .send(product)
    .expect(200)
    .expect("Content-Type", contentType)
    .then((response) => {
      assert(response.body.data.name, product.name);
      assert(response.body.data.barcode, product.barcode);
      product.id = response.body.data.id;
    });
});

test("Get a Product", async () => {
  await api
    .get("/api/v1/products/" + product.id)
    .set("Authorization", auth.token)
    .expect(200)
    .expect("Content-Type", contentType)
    .then((response) => {
      assert(response.body.data.name, product.name);
      assert(response.body.data.barcode, product.barcode);
    });
});

test("Update a Product", async () => {
  await api
    .put("/api/v1/products/" + product.id)
    .set("Authorization", auth.token)
    .send({ name: "Nutrileche 1L" })
    .expect(200)
    .expect("Content-Type", contentType)
    .then((response) => {
      assert(response.body.data, "The update was successfully.");
    });
});

test("Delete a Product", async () => {
  await api
    .delete("/api/v1/products/" + product.id)
    .set("Authorization", auth.token)
    .expect(200)
    .expect("Content-Type", contentType)
    .then((response) => {
      assert(response.body.data, "This was deleted successfully.");
    });
});
afterEach(async () => {
  await server.close();
});
