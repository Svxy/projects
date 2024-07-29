const reposContainer = document.getElementById("repos");
const profileInfoContainer = document.getElementById("profileInfo");
const sortOptions = document.getElementById("sortOptions");

const githubLogoUrl = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

async function fetchProfileInfo() {
  try {
    const response = await fetch("https://api.github.com/users/svxy");
    if (!response.ok) throw new Error("Network response was not ok");
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
      if (!response.ok) throw new Error("Network response was not ok");
      const repos = await response.json();

      if (repos.length === 0) {
        break;
      }

      allRepos = allRepos.concat(repos);
      page++;
    }

    console.log("All repositories fetched:", allRepos);

    sortRepos(allRepos);
    sortOptions.addEventListener("change", () => sortRepos(allRepos));
  } catch (error) {
    console.error("Error fetching repositories:", error);
  }
}

function sortRepos(repos) {
  const sortBy = sortOptions.value;
  console.log("Sorting by:", sortBy);

  if (sortBy === "updated") {
    repos.sort((a, b) => {
      const dateComparison = new Date(b.updated_at) - new Date(a.updated_at);
      if (dateComparison !== 0) return dateComparison;
      return a.name.localeCompare(b.name);
    });
  } else if (sortBy === "stars") {
    repos.sort((a, b) => {
      const starsComparison = b.stargazers_count - a.stargazers_count;
      if (starsComparison !== 0) return starsComparison;
      return a.name.localeCompare(b.name);
    });
  }

  console.log("Sorted repositories:", repos);
  displayRepos(repos);
}

function displayRepos(repos) {
  reposContainer.innerHTML = repos
    .map(
      (repo) => `
      <a href="${repo.html_url}" target="_blank" class="block bg-gray-800 rounded-lg shadow-lg overflow-hidden project-card">
        <img src="${repo.preview_image || githubLogoUrl}" alt="${repo.name}" class="w-full h-64 object-cover">
        <div class="p-4">
          <h3 class="text-xl font-semibold mb-2" style="text-decoration: underline;">${repo.name}</h3>
          <p>${repo.description || "No project description."}</p>
        </div>
      </a>
    `
    )
    .join("");
}

fetchAllRepos();
fetchProfileInfo();