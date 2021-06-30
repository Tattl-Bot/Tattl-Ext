const serverUrl = "https://tattl.herokuapp.com";

async function getStoredValue(key) {
  let value = await browser.storage.sync.get(key);
  let textValue = value[`${key}`];
  return textValue ? textValue : "";
}

async function updateValue(key) {
  let textValue = await getStoredValue(key);

  document.querySelector("#" + key).value = textValue;
}

async function updateWatchlist() {
  let watchListObj = await browser.storage.sync.get("watchList");
  let watchList = watchListObj.watchList;
  let watchListStr = "";

  if (watchList) {
    watchList.forEach((url, index) => {
      if (url.startsWith("*://*.")) {
        url = url.slice(6);
      }
      if (url.endsWith("/*")) {
        url = url.slice(0, -2);
      }
      watchList[index] = url;
    });
    watchListStr = watchList.join("\n");
  }

  document.querySelector("#watchList").value = watchListStr;
}

async function updatePage() {
  let tokenElement = document.querySelector("#token");
  if (tokenElement.value) {
    let tokenBtn = document.querySelector("#tokenBtn");
    let event = { target: tokenBtn };
    handleTokenBtn(event);
  }

  let token = await getStoredValue("token");

  if (token) {
    document.querySelector("#watchList").disabled = false;
    document.querySelector("#name").disabled = false;
    document.querySelector("#discordName").disabled = false;
  } else {
    document.querySelector("#watchList").disabled = true;
    document.querySelector("#name").disabled = true;
    document.querySelector("#discordName").disabled = true;
    document.querySelector("#error").textContent =
      "Please create a profile first";
  }
  await updateWatchlist();
  await updateValue("name");
  await updateValue("discordName");
}

async function handleUpdate(changes, areaName) {
  if (areaName !== "sync") return;

  await updatePage();
}

async function saveProfile() {
  let newName = document.querySelector("#name").value;
  let newDiscordName = document.querySelector("#discordName").value;

  let oldName = await getStoredValue("name");
  let oldDiscordName = await getStoredValue("discordName");

  let dataStr = "";
  let nameChanged = false;
  let discordNameChanged = false;
  if (newName !== oldName) {
    nameChanged = true;
    dataStr += `name=${newName}`;
  }

  if (newDiscordName !== oldDiscordName) {
    discordNameChanged = true;
    if (dataStr.length) dataStr += "&";
    dataStr += `discordName=${newDiscordName}`;
  }

  if (dataStr.length) {
    let token = await getStoredValue("token");
    dataStr += `&token=${token}`;
    const response = await fetch(`${serverUrl}/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: dataStr,
    });

    let responseText = await response.text();
    let error = document.querySelector("#profileError");
    error.textContent = "";
    error.classList.remove("seen");
    error.classList.remove("success");
    error.classList.remove("error");
    setTimeout(() => {
      error.classList.add("seen");
    }, 50);
    if (response.ok) {
      error.classList.add("success");
      error.textContent = "Profile successfully updated";
    } else {
      error.classList.add("error");
      error.textContent = responseText;
      if (responseText === "Discord username taken") discordNameChanged = false;
    }

    if (nameChanged) await browser.storage.sync.set({ name: newName });
    if (discordNameChanged)
      await browser.storage.sync.set({ discordName: newDiscordName });
  }
}

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

async function saveWatchlist() {
  let newWatchlist = document
    .querySelector("#watchList")
    .value.split("\n")
    .filter((url) => url.length > 0)
    .map((url) => {
      if (!url.includes("/")) {
        url += "/*";
        url = "*://*." + url;
      }
      return url;
    });
  let oldWatchlist = await getStoredValue("watchList");

  if (!arrayEquals(oldWatchlist, newWatchlist)) {
    let token = await getStoredValue("token");
    let data = {
      watchList: newWatchlist,
      token: token,
    };
    const response = await fetch(`${serverUrl}/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    let watchListChanged = false;
    let responseText = await response.text();
    let error = document.querySelector("#watchlistError");
    error.textContent = "";
    error.classList.remove("seen");
    error.classList.remove("success");
    error.classList.remove("error");
    if (response.ok) {
      error.classList.add("success");
      error.textContent = "Watchlist successfully updated";
      await browser.storage.sync.set({ watchList: newWatchlist });
      watchListChanged = true;
    } else {
      error.classList.add("error");
      error.textContent = responseText;
    }

    setTimeout(() => {
      error.classList.add("seen");
    }, 50);

    if (watchListChanged) {
      await browser.storage.sync.set({ watchList: newWatchlist });
    }
  }

  updateWatchlist();
}

async function handleTokenBtn(event) {
  let tokenBtn = event.target;
  let revealStr = "Reveal";
  let hideStr = "Hide";
  let tokenElement = document.querySelector("#token");

  if (tokenBtn.textContent === revealStr) {
    tokenBtn.textContent = hideStr;
    let token = await getStoredValue("token");
    tokenElement.value = token;
  } else if (tokenBtn.textContent === hideStr) {
    tokenBtn.textContent = revealStr;
    tokenElement.value = "";
  }
}

function copyToken() {
  let tokenElement = document.querySelector("#token");
  tokenElement.select();
  document.execCommand("copy");
}

function deleteStoredValue(key) {
  return browser.storage.sync.remove(key);
}

async function deleteAllStoredData() {
  await deleteStoredValue("token");
  await deleteStoredValue("watchList");
  await deleteStoredValue("name");
  await deleteStoredValue("discordName");
}

async function deleteUser() {
  const token = await getStoredValue("token");
  const data = {
    token: token,
  };

  const response = await fetch(`${serverUrl}/users`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let responseText = await response.text();
  let error = document.querySelector("#deleteError");
  error.textContent = "";
  error.classList.remove("seen");
  error.classList.remove("success");
  error.classList.remove("error");
  setTimeout(() => {
    error.classList.add("seen");
  }, 50);
  if (response.ok) {
    error.classList.add("success");
    error.textContent = "Profile successfully deleted";
    await deleteAllStoredData();
    await updatePage();
  } else {
    error.classList.add("error");
    if ((responseText = "Please provide a token")) {
      error.textContent = "No user exists";
    }
  }
}

document.querySelector("#saveProfile").addEventListener("click", saveProfile);
document
  .querySelector("#saveWatchlist")
  .addEventListener("click", saveWatchlist);
document.querySelector("#tokenBtn").addEventListener("click", handleTokenBtn);
document.querySelector("#copyTokenBtn").addEventListener("click", copyToken);
document.querySelector("#deleteBtn").addEventListener("click", deleteUser);

browser.storage.onChanged.addListener(handleUpdate);

updatePage();
