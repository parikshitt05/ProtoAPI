const { faker } = require("@faker-js/faker");

const TYPE_MAP = {
  string: () => faker.lorem.word(),
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  number: () => faker.number.int({ min: 1, max: 1000 }),
  boolean: () => faker.datatype.boolean(), // OK in some versions, see below
  date: () => faker.date.recent().toISOString(),
  image_url: () => faker.image.url(),
  uuid: () => faker.string.uuid(),
  phone: () => faker.phone.number(),
  address: () => faker.location.streetAddress(),
  company: () => faker.company.name(),
  url: () => faker.internet.url(),
  color: () => faker.color.human(),
  username: () => faker.internet.username(),
};

const RESERVED_KEYS = new Set(["id", "_id", "__v"]);

const generateRecord = (schemaDefinition) => {
  const record = {};
  for (const [field, type] of Object.entries(schemaDefinition)) {
    // Never let generated data override MongoDB's own id fields
    if (RESERVED_KEYS.has(field)) continue;
    const generator = TYPE_MAP[type] ?? TYPE_MAP["string"];
    record[field] = generator();
  }
  return record;
};

const generateMany = (schemaDefinition, count = 10) =>
  Array.from({ length: count }, () => generateRecord(schemaDefinition));

module.exports = { generateRecord, generateMany };
