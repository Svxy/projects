const reposContainer = document.getElementById("repos");
const profileInfoContainer = document.getElementById("profileInfo");

function checkFirstVisit() {
  const firstVisit = getCookie("firstVisit");
  if (!firstVisit) {
    showWelcomeMessage();
    setCookie("firstVisit", "true", 365);
  }
}

function showWelcomeMessage() {
  const welcomeMessage = document.createElement("div");
  welcomeMessage.classList.add("welcome-message");
  welcomeMessage.innerHTML = `
    <div>Welcome to my projects page!</div>
    <div class="subtitle">This is a page aimed at showcasing my git repos on my own domain, rather than directing users to github.</div>
  `;
  document.body.appendChild(welcomeMessage);

  const hideWelcomeMessage = () => {
    welcomeMessage.style.display = "none";
    welcomeMessage.removeEventListener("animationend", hideWelcomeMessage);
  };

  welcomeMessage.addEventListener("animationend", hideWelcomeMessage);
}

async function fetchProfileInfo() {
  try {
    const response = await fetch("https://api.github.com/users/svxy");
    const profileInfo = await response.json();
    displayProfileInfo(profileInfo);
  } catch (error) {
    console.error("Error fetching profile info:", error);
  }
}

function displayProfileInfo(profileInfo) {
  const profileCard = document.createElement("a");
  profileCard.classList.add("block", "bg-gray-800", "p-4", "rounded-lg", "shadow-lg", "overflow-hidden", "project-card");
  profileCard.href = profileInfo.html_url;
  profileCard.target = "_blank";

  const avatarImg = document.createElement("img");
  avatarImg.src = profileInfo.avatar_url;
  avatarImg.alt = "Profile Avatar";
  avatarImg.classList.add("w-16", "h-16", "rounded-full");

  const profileName = document.createElement("h3");
  profileName.innerText = profileInfo.name || "Svxy";
  profileName.style.textDecoration = "underline";


  const profileBio = document.createElement("p");
  profileBio.innerText = profileInfo.bio || "No bio.";

  const profileLocation = document.createElement("p");
  const locationMarker = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  locationMarker.setAttribute("class", "w-4 h-4 inline-block");
  locationMarker.setAttribute("fill", "currentColor");
  locationMarker.setAttribute("viewBox", "0 0 24 24");
  locationMarker.innerHTML = `<path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>`;

  profileLocation.appendChild(locationMarker);
  profileLocation.innerHTML += ` ${profileInfo.location || "No location."}`;

  profileCard.appendChild(avatarImg);
  profileCard.appendChild(profileName);
  profileCard.appendChild(profileBio);
  profileCard.appendChild(profileLocation);

  profileInfoContainer.appendChild(profileCard);
}

async function fetchAllRepos() {
  let page = 1;
  let allRepos = [];

  try {
    while (true) {
      const response = await fetch(`https://api.github.com/users/svxy/repos?page=${page}&per_page=100`);
      const repos = await response.json();

      if (repos.length === 0) {
        break;
      }

      allRepos = allRepos.concat(repos);
      page++;
    }

    allRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    displayRepos(allRepos);
  } catch (error) {
    console.error("Error fetching repositories:", error);
  }
}

function displayRepos(repos) {
  reposContainer.innerHTML = repos
    .map(
      (repo) => `
      <a href="${repo.html_url}" target="_blank" class="block bg-gray-800 rounded-lg shadow-lg overflow-hidden project-card">
      <img src="${repo.preview_image || repo.owner.avatar_url}" alt="${repo.name}" class="w-full h-32 object-cover">
      <div class="p-4">
          <h3 class="text-xl font-semibold mb-2" style="text-decoration: underline;">${repo.name}</h3>
          <p>${repo.description || "No project description."}</p>
        </div>
      </a>
    `
    )
    .join("");
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(name + "=") === 0) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

function resetWelcomeCookie() {
  setCookie("firstVisit", "", -1);
  console.log("success");
}

checkFirstVisit();
fetchAllRepos();
fetchProfileInfo();