const { isHash } = require("../../../../utils/isHash");
const {
  block: { getBlockCollection, getUnFinalizedBlockCollection },
} = require("@statescan/mongo");
const { getOverview } = require("../../../../jobs/overview");

function handleBlockHeight(term) {
  let searchHeight;
  try {
    searchHeight = parseInt(term);
  } catch (e) {
    return null;
  }

  const latestHeight = parseInt(getOverview().latestHeight);
  if (searchHeight <= latestHeight) {
    return searchHeight;
  }

  return null;
}

async function handleBlockHash(term = "") {
  if (!isHash(term)) {
    return null;
  }

  const blockCol = await getBlockCollection();
  let arr = await blockCol.find({ hash: term }).limit(1).toArray();
  if (arr.length > 0) {
    return term;
  }

  const unFinalizedCol = await getUnFinalizedBlockCollection();
  arr = await unFinalizedCol.find({ hash: term }).limit(1).toArray();
  if (arr.length > 0) {
    return term;
  }

  return null;
}

async function queryBlock(term = "") {
  const isNum = /^[0-9]+$/.test(term);
  let result = null;
  if (isNum) {
    result = handleBlockHeight(term);
  } else if (isHash(term)) {
    result = await handleBlockHash(term);
  }

  return result;
}

module.exports = {
  queryBlock,
};
