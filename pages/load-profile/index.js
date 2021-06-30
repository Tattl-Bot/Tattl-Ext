window.addEventListener("load", function () {
  const serverUrl = "http://localhost:8080";
  const form = document.querySelector("#loadProfile");

  async function sendData() {
    let tokenElement = document.querySelector("#token");
    let token = tokenElement.value;

    const data = `token=${token}`;

    const response = await fetch(`${serverUrl}/users/loadProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });

    let info = document.querySelector("#info");
    info.textContent = "";
    info.classList.remove("seen");
    info.classList.remove("success");
    info.classList.remove("error");
    setTimeout(() => {
      info.classList.add("seen");
    }, 50);
    if (response.ok) {
      info.classList.add("success");
      info.textContent = "Profile successfully loaded";

      tokenElement.value = "";

      let { name, discordName, watchList } = await response.json();
      await browser.storage.sync.set({
        name: name,
        discordName: discordName,
        watchList: watchList,
        token: token,
      });
    } else {
      info.classList.add("error");
      let responseText = await response.text();
      info.textContent = responseText;
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    await sendData();
  });
});
