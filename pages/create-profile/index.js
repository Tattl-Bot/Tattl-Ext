window.addEventListener("load", function () {
  const serverUrl = "http://localhost:8080";
  const form = document.querySelector("#createProfile");

  async function sendData() {
    let nameElement = document.querySelector("#name");
    let discordNameElement = document.querySelector("#discordName");
    let name = nameElement.value;
    let discordName = discordNameElement.value;

    const data = `name=${name}&discordName=${discordName}`;

    const response = await fetch(`${serverUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });

    let responseText = await response.text();
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
      info.textContent = "New profile successfully created";
      nameElement.value = "";
      discordNameElement.value = "";
      let token = responseText;
      await browser.storage.sync.set({
        name: name,
        discordName: discordName,
        watchList: null,
        token: token,
      });
    } else {
      info.classList.add("error");
      info.textContent = responseText;
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    await sendData();
  });
});
