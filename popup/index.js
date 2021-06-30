function openConfigPage() {
  openExtensionPage("pages/configuration/index.html");
}

function openCreateProfilePage() {
  openExtensionPage("pages/create-profile/index.html");
}

function openLoadProfilePage() {
  openExtensionPage("pages/load-profile/index.html");
}

function openExtensionPage(url) {
  let fullURL = browser.extension.getURL(url);

  browser.tabs.query({ url: fullURL }).then(onGot, onError);

  function onGot(tabs) {
    if (tabs.length > 0) {
      browser.tabs.update(tabs[0].id, { active: true });
    } else {
      browser.tabs.create({ url: fullURL });
    }
    window.close();
  }

  function onError(error) {
    browser.tabs.create({ url: fullURL });
    window.close();
  }
}

async function updateConfigBtn() {
  let storedValue = await browser.storage.sync.get("token");
  let token = storedValue.token;
  document.querySelector("#config").disabled = token ? false : true;
}

async function initPage() {
  await updateConfigBtn();
}

async function handleUpdate() {
  await initPage();
}

browser.storage.onChanged.addListener(handleUpdate);

initPage();

document.querySelector("#config").addEventListener("click", openConfigPage);
document
  .querySelector("#createProfile")
  .addEventListener("click", openCreateProfilePage);

document
  .querySelector("#loadProfile")
  .addEventListener("click", openLoadProfilePage);
