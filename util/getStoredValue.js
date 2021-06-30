async function getStoredValue(key) {
  let value = await browser.storage.sync.get(key);
  let textValue = value[`${key}`];
  return textValue ? textValue : "";
}

export default getStoredValue;
