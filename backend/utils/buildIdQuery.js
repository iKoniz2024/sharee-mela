const { ObjectId } = require("mongodb");

/**
 * Builds a query object that safely matches MongoDB documents by _id,
 * regardless of whether _id is stored as ObjectId or String.
 */
const buildIdQuery = (id) => {
  if (!id) return { _id: null };
  const strId = String(id);
  if (ObjectId.isValid(strId)) {
    return {
      $or: [
        { _id: new ObjectId(strId) },
        { _id: strId }
      ]
    };
  }
  return { _id: strId };
};

module.exports = { buildIdQuery };
